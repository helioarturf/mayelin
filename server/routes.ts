import crypto from 'node:crypto';
import { Router } from 'express';
import type { Response } from 'express';
import {
  getSupabaseClient,
  getSupabaseJwksUrl,
  handleDbError,
  isJwksConfigured,
  isSupabaseConfigured,
  resolveSupabaseKey,
  resolveSupabaseUrl
} from './supabase.ts';
import {
  formatEducatorNameServer,
  hashPassword,
  requireAuth,
  requireRole,
  signSessionToken,
  verifyPassword
} from './auth.ts';
import type { AuthRequest, PortalRole, SessionUser } from './auth.ts';
import {
  alterFactPlusDocument,
  createFactPlusDocument,
  isFactPlusConfigured,
  resolveFactPlusApiUrl,
  runLocalFiscalValidation,
  viewFactPlusDocument
} from './factplus.ts';
import type { FactPlusDocType } from './factplus.ts';

function normalizeRoleInput(role?: string): PortalRole {
  if (role === 'admin') return 'admin';
  if (role === 'educador' || role === 'professor') return 'educador';
  return 'pais';
}

function sendDbError(res: Response, error: unknown, fallback: string): void {
  const { status, message } = handleDbError(error, fallback);
  res.status(status).json({ error: message });
}

const ALLOWED_ANNOUNCEMENT_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp'
]);

const MAX_ANNOUNCEMENT_FILE_BYTES = 3 * 1024 * 1024; // 3 MB

function sanitizeAnnouncementFilename(rawName: string): string {
  const base = rawName.split(/[/\\]/).pop() || 'circular-documento';
  const cleaned = base.replace(/[^\w.\-\s()]/g, '_').trim();
  return (cleaned || 'circular-documento').slice(0, 140);
}

function parseValidatedAnnouncementAttachment(input: unknown): {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
} | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as { name?: unknown; type?: unknown; dataUrl?: unknown };
  if (typeof obj.name !== 'string' || typeof obj.dataUrl !== 'string') {
    throw new Error('Dados do documento anexo inválidos.');
  }
  const match = obj.dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error('Formato do ficheiro inválido. Utilize PDF, Word, TXT ou imagem.');
  }
  const mime = match[1].toLowerCase();
  if (!ALLOWED_ANNOUNCEMENT_MIME_TYPES.has(mime)) {
    throw new Error('Tipo de ficheiro não permitido. Aceite apenas PDF, DOC, DOCX, TXT, PNG, JPG ou WEBP.');
  }
  const byteSize = Buffer.byteLength(match[2], 'base64');
  if (byteSize <= 0 || byteSize > MAX_ANNOUNCEMENT_FILE_BYTES) {
    throw new Error('O documento excede o limite máximo de 3 MB.');
  }

  return {
    name: sanitizeAnnouncementFilename(obj.name),
    type: mime,
    size: byteSize,
    dataUrl: `data:${mime};base64,${match[2]}`
  };
}

function stripAnnouncementAttachmentData<T extends Record<string, unknown>>(row: T): Omit<T, 'attachment_data'> {
  if (!row || typeof row !== 'object') return row;
  const { attachment_data: _omitted, ...rest } = row;
  return rest;
}

export function createApiRouter(): Router {
  const router = Router();

  // ============================================================================
  // PUBLIC HEALTH & AUTH STATUS
  // ============================================================================
  router.get('/health', async (_req, res) => {
    const hasUrl = Boolean(resolveSupabaseUrl());
    const hasKey = Boolean(resolveSupabaseKey());
    const configured = hasUrl && hasKey;
    const jwksConfigured = isJwksConfigured() || Boolean(getSupabaseJwksUrl());

    if (!configured) {
      res.json({ ok: true, supabaseConfigured: false, schemaReady: false, jwksConfigured, hasUrl, hasKey });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('portal_users').select('id', { count: 'exact', head: true });
      if (error) {
        res.json({ ok: true, supabaseConfigured: true, schemaReady: false, jwksConfigured, hasUrl, hasKey });
        return;
      }
      res.json({ ok: true, supabaseConfigured: true, schemaReady: true, jwksConfigured, hasUrl, hasKey });
    } catch {
      res.json({ ok: true, supabaseConfigured: true, schemaReady: false, jwksConfigured, hasUrl, hasKey });
    }
  });

  router.get('/auth/status', async (_req, res) => {
    const hasUrl = Boolean(resolveSupabaseUrl());
    const hasKey = Boolean(resolveSupabaseKey());
    const supabaseConfigured = hasUrl && hasKey;
    if (!supabaseConfigured) {
      res.json({
        supabaseConfigured: false,
        schemaReady: false,
        needsInitialSetup: false,
        hasUrl,
        hasKey
      });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { count, error } = await supabase
        .from('portal_users')
        .select('id', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          res.json({
            supabaseConfigured: true,
            schemaReady: false,
            needsInitialSetup: false
          });
          return;
        }
        throw error;
      }

      res.json({
        supabaseConfigured: true,
        schemaReady: true,
        needsInitialSetup: (count ?? 0) === 0
      });
    } catch (error) {
      sendDbError(res, error, 'Não foi possível verificar o estado da autenticação.');
    }
  });

  // One-time atomic initial administrator claim when portal_users is empty
  router.post('/auth/setup-admin', async (req, res) => {
    const { name, email, password, nif } = req.body ?? {};
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.includes('@') ||
      password.length < 8
    ) {
      res.status(400).json({
        error: 'Informe nome completo, e-mail válido e uma palavra-passe com pelo menos 8 caracteres.'
      });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { count, error: countError } = await supabase
        .from('portal_users')
        .select('id', { count: 'exact', head: true });

      if (countError) throw countError;
      if ((count ?? 0) > 0) {
        res.status(409).json({
          error: 'O administrador inicial já foi configurado. Inicie sessão com as suas credenciais.'
        });
        return;
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const passwordHash = hashPassword(password);

      const { data: created, error: insertError } = await supabase
        .from('portal_users')
        .insert({
          name: cleanName,
          email: cleanEmail,
          password_hash: passwordHash,
          role: 'admin',
          title: 'Direção & Secretaria Geral',
          avatar_letter: cleanName.charAt(0).toUpperCase(),
          nif: typeof nif === 'string' && nif.trim() ? nif.trim() : null,
          access_level: 'Super Admin',
          department: 'Secretaria e Conselho Executivo',
          two_factor_enabled: true,
          status: 'Ativo',
          last_access: 'Sessão Ativa Agora'
        })
        .select('id, name, email, role, title, avatar_letter, nif')
        .single();

      if (insertError) throw insertError;

      const user: SessionUser = {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        title: created.title,
        avatarLetter: created.avatar_letter,
        nif: created.nif || undefined
      };

      const token = signSessionToken(user);
      res.status(201).json({ token, user });
    } catch (error) {
      sendDbError(res, error, 'Erro ao criar administrador inicial.');
    }
  });

  // Real database login
  router.post('/auth/login', async (req, res) => {
    const { identifier, password, role } = req.body ?? {};
    if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier.trim() || !password) {
      res.status(400).json({ error: 'Preencha o e-mail/NIF e a palavra-passe.' });
      return;
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    try {
      const supabase = getSupabaseClient();
      const isEmail = cleanIdentifier.includes('@');
      const query = supabase
        .from('portal_users')
        .select('id, name, email, password_hash, role, title, avatar_letter, nif, status');

      const { data: userRow, error } = isEmail
        ? await query.eq('email', cleanIdentifier).maybeSingle()
        : await query.eq('nif', identifier.trim()).maybeSingle();

      if (error) throw error;

      if (!userRow || !verifyPassword(password, userRow.password_hash)) {
        res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail/NIF e a palavra-passe.' });
        return;
      }

      if (userRow.status !== 'Ativo') {
        res.status(403).json({ error: 'Este acesso encontra-se temporariamente suspenso pela Direção.' });
        return;
      }

      if (typeof role === 'string' && role.trim()) {
        const requestedRole = normalizeRoleInput(role);
        if (userRow.role !== requestedRole) {
          res.status(403).json({
            error: `Esta conta pertence ao perfil "${userRow.role === 'admin' ? 'Administração' : userRow.role === 'educador' ? 'Educadora (Tia)' : 'Pais / Encarregados'}". Selecione o separador correspondente.`
          });
          return;
        }
      }

      const displayName = userRow.role === 'educador' ? formatEducatorNameServer(userRow.name) : userRow.name;

      await supabase
        .from('portal_users')
        .update({ last_access: `Hoje, ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` })
        .eq('id', userRow.id);

      const sessionUser: SessionUser = {
        id: userRow.id,
        name: displayName,
        email: userRow.email,
        role: userRow.role,
        title: userRow.title,
        avatarLetter: userRow.avatar_letter,
        nif: userRow.nif || undefined
      };

      const token = signSessionToken(sessionUser);
      res.json({ token, user: sessionUser });
    } catch (error) {
      sendDbError(res, error, 'Erro ao autenticar utilizador.');
    }
  });

  router.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // ============================================================================
  // PUBLIC VISIT APPOINTMENT (LANDING PAGE)
  // ============================================================================
  router.post('/appointments', async (req, res) => {
    const { ageGroup, shift, parentName, childName, whatsapp, email, date, time, notes } = req.body ?? {};
    if (
      !['bercario', 'maternal', 'jardim'].includes(ageGroup) ||
      !['matutino', 'vespertino', 'integral'].includes(shift) ||
      typeof parentName !== 'string' ||
      !parentName.trim() ||
      typeof childName !== 'string' ||
      !childName.trim() ||
      typeof whatsapp !== 'string' ||
      !whatsapp.trim() ||
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) ||
      typeof time !== 'string' ||
      !/^\d{2}:\d{2}$/.test(time.trim())
    ) {
      res.status(400).json({ error: 'Dados do agendamento inválidos ou incompletos.' });
      return;
    }

    const [yr, mo, dy] = date.trim().split('-').map(Number);
    const parsedDate = new Date(yr, mo - 1, dy);
    if (
      parsedDate.getFullYear() !== yr ||
      parsedDate.getMonth() !== mo - 1 ||
      parsedDate.getDate() !== dy
    ) {
      res.status(400).json({ error: 'Data de visita inválida.' });
      return;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (date.trim() < todayStr) {
      res.status(400).json({ error: 'Não é possível agendar visitas em dias passados.' });
      return;
    }

    const dayOfWeek = parsedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      res.status(400).json({ error: 'Agendamentos disponíveis apenas de segunda a sexta-feira (sem finais de semana).' });
      return;
    }

    const [hr, min] = time.trim().split(':').map(Number);
    const totalMinutes = hr * 60 + min;
    if (!Number.isFinite(hr) || !Number.isFinite(min) || hr > 23 || min > 59 || totalMinutes < 8 * 60 || totalMinutes > 17 * 60 + 30) {
      res.status(400).json({ error: 'Horário fora do período de atendimento para visitas (08:00 às 17:30).' });
      return;
    }

    if (date.trim() === todayStr && totalMinutes <= now.getHours() * 60 + now.getMinutes()) {
      res.status(400).json({ error: 'Este horário já passou para a data de hoje. Selecione um horário futuro.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('visit_appointments')
        .insert({
          age_group: ageGroup,
          shift,
          parent_name: parentName.trim(),
          child_name: childName.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim().toLowerCase(),
          visit_date: date.trim(),
          visit_time: time.trim(),
          notes: typeof notes === 'string' ? notes.trim() : null,
          status: 'Agendada'
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ appointment: data });
    } catch (error) {
      sendDbError(res, error, 'Não foi possível registar o agendamento de visita.');
    }
  });

  // ============================================================================
  // ADMIN WORKSPACE ROUTES
  // ============================================================================
  router.get('/admin/overview', requireAuth, requireRole(['admin']), async (_req: AuthRequest, res) => {
    try {
      const supabase = getSupabaseClient();
      const [classesRes, financeRes, staffRes, announcementsRes, appointmentsRes, studentsRes, pickupsRes] =
        await Promise.all([
          supabase.from('classrooms').select('*').order('created_at', { ascending: true }),
          supabase.from('financial_records').select('*').order('created_at', { ascending: false }),
          supabase
            .from('portal_users')
            .select('id, name, email, role, title, avatar_letter, nif, phone, access_level, department, two_factor_enabled, status, last_access, created_at')
            .order('created_at', { ascending: false }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }),
          supabase.from('visit_appointments').select('*').order('created_at', { ascending: false }),
          supabase.from('students').select('*').order('student_number', { ascending: true }),
          supabase.from('pickup_authorizations').select('*').order('created_at', { ascending: false })
        ]);

      for (const r of [classesRes, financeRes, staffRes, announcementsRes, appointmentsRes, studentsRes, pickupsRes]) {
        if (r.error) throw r.error;
      }

      res.json({
        classrooms: classesRes.data ?? [],
        financialRecords: financeRes.data ?? [],
        staffList: staffRes.data ?? [],
        announcements: (announcementsRes.data ?? []).map((a) => stripAnnouncementAttachmentData(a)),
        appointments: appointmentsRes.data ?? [],
        students: studentsRes.data ?? [],
        pickupAuthorizations: pickupsRes.data ?? []
      });
    } catch (error) {
      sendDbError(res, error, 'Erro ao carregar dados administrativos do Supabase.');
    }
  });

  router.post('/admin/classrooms', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { name, cycle, capacity, leadTeacher, room, schedule, ratio, subjects } = req.body ?? {};
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof cycle !== 'string' ||
      !cycle.trim() ||
      typeof leadTeacher !== 'string' ||
      !leadTeacher.trim()
    ) {
      res.status(400).json({ error: 'Nome da turma, ciclo e educadora titular são obrigatórios.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const cleanTeacher = formatEducatorNameServer(leadTeacher);
      const parsedCap = Math.max(1, Number(capacity) || 18);

      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          name: name.trim(),
          cycle: cycle.trim(),
          capacity: parsedCap,
          enrolled: 0,
          ratio: typeof ratio === 'string' && ratio.trim() ? ratio.trim() : '1:6 (Tia Educadora + Auxiliar)',
          lead_teacher: cleanTeacher,
          subjects: Array.isArray(subjects) && subjects.length > 0
            ? subjects.map(String)
            : ['Desenvolvimento Sensorial', 'Socialização Lúdica', 'Expressão Criativa'],
          room: typeof room === 'string' && room.trim() ? room.trim() : 'Pavilhão Infantil',
          schedule: typeof schedule === 'string' && schedule.trim() ? schedule.trim() : '07:30 - 18:30 (Integral/Semi)'
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ classroom: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao criar turma.');
    }
  });

  router.post('/admin/staff', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { name, email, password, accessRole, nif, phone } = req.body ?? {};
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      res.status(400).json({
        error: 'Nome, e-mail válido e palavra-passe inicial (mín. 8 caracteres) são obrigatórios.'
      });
      return;
    }

    const isEducadora = accessRole === 'Educadora (Tia)' || accessRole === 'educador';
    const isParent = accessRole === 'Pais' || accessRole === 'pais';
    const portalRole: PortalRole = isEducadora ? 'educador' : isParent ? 'pais' : 'admin';
    const formattedName = isEducadora ? formatEducatorNameServer(name) : name.trim();

    const roleTitle = isEducadora
      ? 'Educadora de Infância (Tia)'
      : isParent
      ? 'Encarregado de Educação'
      : accessRole === 'Portaria'
      ? 'Agente de Portaria & Segurança'
      : accessRole === 'SPO'
      ? 'Técnico de Psicologia (SPO)'
      : 'Secretaria Geral & Gestão';

    const department = isEducadora
      ? 'Corpo de Educadoras (Tias)'
      : isParent
      ? 'Famílias & Encarregados'
      : accessRole === 'Portaria'
      ? 'Operações e Segurança'
      : accessRole === 'SPO'
      ? 'SPO (Serviço de Psicologia e Orientação)'
      : 'Secretaria e Conselho Executivo';

    const accessLevel = isEducadora
      ? 'Educadora (Tia)'
      : isParent
      ? 'Encarregado'
      : accessRole === 'Portaria'
      ? 'Portaria / Segurança'
      : accessRole === 'SPO'
      ? 'SPO (Dados Sensíveis)'
      : 'Super Admin';

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('portal_users')
        .insert({
          name: formattedName,
          email: email.trim().toLowerCase(),
          password_hash: hashPassword(password),
          role: portalRole,
          title: roleTitle,
          avatar_letter: formattedName.charAt(0).toUpperCase(),
          nif: typeof nif === 'string' && nif.trim() ? nif.trim() : null,
          phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
          access_level: accessLevel,
          department,
          two_factor_enabled: true,
          status: 'Ativo',
          last_access: 'Conta criada (Pronta para login)'
        })
        .select('id, name, email, role, title, avatar_letter, nif, phone, access_level, department, two_factor_enabled, status, last_access, created_at')
        .single();

      if (error) throw error;
      res.status(201).json({ staff: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao cadastrar utilizador.');
    }
  });

  router.patch('/admin/staff/:id/status', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    if (!['Ativo', 'Revogado'].includes(status)) {
      res.status(400).json({ error: 'Estado inválido.' });
      return;
    }
    if (req.user?.id === id && status === 'Revogado') {
      res.status(400).json({ error: 'Não pode revogar a sua própria sessão de administrador.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('portal_users')
        .update({ status })
        .eq('id', id)
        .select('id, name, email, role, title, avatar_letter, nif, phone, access_level, department, two_factor_enabled, status, last_access, created_at')
        .single();

      if (error) throw error;
      res.json({ staff: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao atualizar estado do utilizador.');
    }
  });

  router.post('/admin/students', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { name, classroomName, age, responsibleName, guardianEmail, allergies, medications } = req.body ?? {};
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof classroomName !== 'string' ||
      !classroomName.trim() ||
      typeof age !== 'string' ||
      !age.trim() ||
      typeof responsibleName !== 'string' ||
      !responsibleName.trim()
    ) {
      res.status(400).json({ error: 'Nome da criança, turma, idade e responsável são obrigatórios.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const [{ data: cls }, { count: studentCount }, guardianRes] = await Promise.all([
        supabase.from('classrooms').select('id, cycle, lead_teacher, enrolled').eq('name', classroomName.trim()).maybeSingle(),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        typeof guardianEmail === 'string' && guardianEmail.includes('@')
          ? supabase.from('portal_users').select('id').eq('email', guardianEmail.trim().toLowerCase()).maybeSingle()
          : Promise.resolve({ data: null, error: null })
      ]);

      const nextNumber = (studentCount ?? 0) + 1;
      const teacherName = cls?.lead_teacher ? formatEducatorNameServer(cls.lead_teacher) : 'Tia Clara Marques';

      const { data, error } = await supabase
        .from('students')
        .insert({
          student_number: nextNumber,
          name: name.trim(),
          classroom_id: cls?.id || null,
          classroom_name: classroomName.trim(),
          cycle: cls?.cycle || 'Creche & Educação Infantil',
          age: age.trim(),
          avatar_letter: name.trim().charAt(0).toUpperCase(),
          status: 'Presente',
          guardian_user_id: guardianRes.data?.id || null,
          responsible_name: responsibleName.trim(),
          teacher_name: teacherName,
          allergies: Array.isArray(allergies) ? allergies.map(String).filter(Boolean) : [],
          medications: Array.isArray(medications) ? medications.map(String).filter(Boolean) : []
        })
        .select('*')
        .single();

      if (error) throw error;

      if (cls?.id) {
        await supabase
          .from('classrooms')
          .update({ enrolled: (cls.enrolled ?? 0) + 1 })
          .eq('id', cls.id);
      }

      res.status(201).json({ student: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao matricular criança.');
    }
  });

  router.post('/admin/financial', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { studentId, studentName, guardianName, nif, classGroup, description, amount, paymentMethod, dueDate, status } = req.body ?? {};
    const numericAmount = Number(amount);
    if (
      typeof studentName !== 'string' ||
      !studentName.trim() ||
      typeof guardianName !== 'string' ||
      !guardianName.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      res.status(400).json({ error: 'Dados da fatura inválidos.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      let guardianUserId: string | null = null;
      if (typeof studentId === 'string' && studentId.trim()) {
        const { data: st } = await supabase.from('students').select('guardian_user_id').eq('id', studentId).maybeSingle();
        guardianUserId = st?.guardian_user_id ?? null;
      }

      const invoiceNumber = `FT-${new Date().getFullYear()}/${String(Math.floor(1000 + Math.random() * 9000))}`;
      const { data, error } = await supabase
        .from('financial_records')
        .insert({
          student_id: typeof studentId === 'string' && studentId.trim() ? studentId : null,
          guardian_user_id: guardianUserId,
          student_name: studentName.trim(),
          guardian_name: guardianName.trim(),
          nif: typeof nif === 'string' && nif.trim() ? nif.trim() : '999999999',
          class_group: typeof classGroup === 'string' && classGroup.trim() ? classGroup.trim() : 'Creche Mayelin',
          description: typeof description === 'string' && description.trim() ? description.trim() : 'Mensalidade Escolar',
          amount: numericAmount,
          payment_method: typeof paymentMethod === 'string' && paymentMethod.trim() ? paymentMethod.trim() : 'Multicaixa Express (MCX)',
          status: ['Liquidado', 'Pendente', 'Aviso Enviado'].includes(status) ? status : 'Pendente',
          invoice_number: invoiceNumber,
          due_date: typeof dueDate === 'string' && dueDate.trim() ? dueDate.trim() : new Date().toLocaleDateString('pt-PT')
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ record: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao emitir fatura.');
    }
  });

  router.patch('/admin/financial/:id/status', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    if (!['Liquidado', 'Pendente', 'Aviso Enviado'].includes(status)) {
      res.status(400).json({ error: 'Estado financeiro inválido.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('financial_records')
        .update({
          status,
          paid_date: status === 'Liquidado' ? new Date().toLocaleDateString('pt-PT') : null
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      // Best-effort sync with FactPlus if record has an active FactPlus reference
      if (status === 'Liquidado' && data?.factplus_reference && isFactPlusConfigured()) {
        try {
          await alterFactPlusDocument(String(data.factplus_reference), 'factura', 'settled');
        } catch {
          // Do not block local settlement status if FactPlus sync fails
        }
      }

      res.json({ record: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao atualizar estado financeiro.');
    }
  });

  // ============================================================================
  // FACTPLUS API INTEGRATION (SERVER-SIDE ONLY)
  // ============================================================================
  router.get('/admin/factplus/status', requireAuth, requireRole(['admin']), (_req, res) => {
    let apiUrl = 'https://api.factplus.co.ao';
    try {
      apiUrl = resolveFactPlusApiUrl();
    } catch {
      // Keep default display value if custom URL fails validation
    }
    res.json({
      configured: isFactPlusConfigured(),
      apiUrl
    });
  });

  router.post('/admin/financial/:id/validate-factplus', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    const body = (req.body ?? {}) as { reference?: string; docType?: string };
    const docType: FactPlusDocType =
      body.docType === 'factura-recibo' || body.docType === 'proforma' ? body.docType : 'factura';

    try {
      const supabase = getSupabaseClient();
      const { data: record, error: fetchError } = await supabase
        .from('financial_records')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!record) {
        res.status(404).json({ error: 'Fatura não encontrada.' });
        return;
      }

      const localValidation = runLocalFiscalValidation(record);
      const configured = isFactPlusConfigured();

      if (!localValidation.valid) {
        res.json({
          valid: false,
          configured,
          mode: 'local-check',
          reference: record.factplus_reference ?? null,
          factplusStatus: 'Dados Fiscais Inválidos',
          message: 'Corrija os campos assinalados antes de validar na FactPlus.',
          checks: localValidation.checks,
          record
        });
        return;
      }

      if (!configured) {
        res.json({
          valid: false,
          configured: false,
          mode: 'local-only',
          reference: record.factplus_reference ?? null,
          factplusStatus: 'API Não Configurada',
          message:
            'Pré-validação AGT concluída com sucesso. Para certificação online na FactPlus, configure FACTPLUS_API_KEY nas variáveis secretas do servidor.',
          checks: localValidation.checks,
          record
        });
        return;
      }

      const providedRef = typeof body.reference === 'string' && body.reference.trim() ? body.reference.trim() : null;
      const existingRef =
        typeof record.factplus_reference === 'string' && record.factplus_reference.trim()
          ? record.factplus_reference.trim()
          : null;
      const targetRef = providedRef || existingRef;

      let valid = false;
      let mode: 'create' | 'view' = targetRef ? 'view' : 'create';
      let resultRef: string | null = targetRef;
      let statusLabel = 'Pendente';
      let message = '';

      if (targetRef) {
        const viewRes = await viewFactPlusDocument(targetRef, docType);
        valid = viewRes.success;
        resultRef = viewRes.reference;
        statusLabel = viewRes.success
          ? viewRes.statusText
            ? `Validada (${viewRes.statusText})`
            : 'Validada na FactPlus'
          : 'Não Validada na FactPlus';
        message = viewRes.message;
      } else {
        const createRes = await createFactPlusDocument(record, localValidation, docType);
        valid = createRes.success;
        resultRef = createRes.reference;
        statusLabel = createRes.success ? 'Certificada FactPlus' : 'Rejeitada pela FactPlus';
        message = createRes.message;
      }

      let updatedRecord = record;
      let schemaColumnWarning = false;

      const { data: savedRecord, error: updateError } = await supabase
        .from('financial_records')
        .update({
          factplus_reference: resultRef,
          factplus_status: statusLabel,
          factplus_validated_at: new Date().toISOString(),
          factplus_message: message
        })
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (updateError) {
        // Gracefully handle environments where optional FactPlus columns are not yet migrated
        const errCode = (updateError as { code?: string }).code;
        if (errCode === '42703' || errCode === 'PGRST204') {
          schemaColumnWarning = true;
        } else {
          throw updateError;
        }
      } else if (savedRecord) {
        updatedRecord = savedRecord;
      }

      res.json({
        valid,
        configured: true,
        mode,
        reference: resultRef,
        factplusStatus: statusLabel,
        message,
        checks: localValidation.checks,
        schemaColumnWarning,
        record: updatedRecord
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Erro ao comunicar com a API FactPlus.';
      res.status(502).json({ error: errMsg });
    }
  });

  router.post('/admin/factplus/verify-reference', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { reference, docType, financialRecordId } = (req.body ?? {}) as {
      reference?: string;
      docType?: string;
      financialRecordId?: string;
    };

    if (typeof reference !== 'string' || !reference.trim() || reference.trim().length > 80) {
      res.status(400).json({ error: 'Indique uma referência de factura FactPlus válida.' });
      return;
    }

    if (!isFactPlusConfigured()) {
      res.status(503).json({
        error: 'FACTPLUS_API_KEY não está configurada nas variáveis secretas do servidor.'
      });
      return;
    }

    const parsedType: FactPlusDocType | undefined =
      docType === 'factura' ||
      docType === 'factura-recibo' ||
      docType === 'proforma' ||
      docType === 'nota-credito' ||
      docType === 'nota-debito'
        ? docType
        : undefined;

    try {
      const viewRes = await viewFactPlusDocument(reference.trim(), parsedType);
      let updatedRecord = null;

      if (typeof financialRecordId === 'string' && financialRecordId.trim()) {
        const supabase = getSupabaseClient();
        const { data: saved, error: updateError } = await supabase
          .from('financial_records')
          .update({
            factplus_reference: viewRes.reference,
            factplus_status: viewRes.success ? 'Validada na FactPlus' : 'Não Validada na FactPlus',
            factplus_validated_at: new Date().toISOString(),
            factplus_message: viewRes.message
          })
          .eq('id', financialRecordId.trim())
          .select('*')
          .maybeSingle();

        if (!updateError && saved) {
          updatedRecord = saved;
        }
      }

      res.json({
        valid: viewRes.success,
        reference: viewRes.reference,
        statusText: viewRes.statusText,
        message: viewRes.message,
        record: updatedRecord
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Erro ao consultar referência na FactPlus.';
      res.status(502).json({ error: errMsg });
    }
  });

  router.post('/admin/announcements', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { title, content, channels, target, priority, authorizationsRequired, attachment } = req.body ?? {};
    let parsedAttachment: ReturnType<typeof parseValidatedAnnouncementAttachment> = null;
    try {
      if (attachment !== undefined && attachment !== null) {
        parsedAttachment = parseValidatedAnnouncementAttachment(attachment);
      }
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Documento anexo inválido.' });
      return;
    }

    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    const finalContent =
      trimmedContent || (parsedAttachment ? `Consulte o documento anexo: ${parsedAttachment.name}` : '');

    if (!trimmedTitle || !finalContent) {
      res.status(400).json({ error: 'Título e conteúdo ou documento da circular são obrigatórios.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { count: studentCount } = await supabase.from('students').select('id', { count: 'exact', head: true });
      const totalRecipients = studentCount || 0;

      const basePayload = {
        title: trimmedTitle,
        content: finalContent,
        channels: Array.isArray(channels) && channels.length > 0 ? channels.map(String) : ['App Push', 'E-mail'],
        target: ['todos', 'pais', 'educadoras', 'professores'].includes(target) ? target : 'todos',
        priority: ['normal', 'importante', 'urgente'].includes(priority) ? priority : 'normal',
        author: req.user?.name || 'Direção Geral',
        open_rate: 100,
        recipient_count: totalRecipients,
        authorizations_required: Boolean(authorizationsRequired),
        authorizations_signed_count: 0,
        authorizations_total: totalRecipients,
        status: 'Enviada'
      };

      const insertPayload = parsedAttachment
        ? {
            ...basePayload,
            attachment_name: parsedAttachment.name,
            attachment_type: parsedAttachment.type,
            attachment_size: parsedAttachment.size,
            attachment_data: parsedAttachment.dataUrl
          }
        : basePayload;

      let schemaColumnWarning = false;
      let { data, error } = await supabase
        .from('announcements')
        .insert(insertPayload)
        .select('*')
        .single();

      if (error && parsedAttachment) {
        const errCode = (error as { code?: string }).code;
        if (errCode === '42703' || errCode === 'PGRST204') {
          schemaColumnWarning = true;
          const fallbackRes = await supabase
            .from('announcements')
            .insert(basePayload)
            .select('*')
            .single();
          data = fallbackRes.data;
          error = fallbackRes.error;
        }
      }

      if (error) throw error;
      res.status(201).json({
        announcement: stripAnnouncementAttachmentData(data),
        schemaColumnWarning
      });
    } catch (error) {
      sendDbError(res, error, 'Erro ao publicar circular.');
    }
  });

  router.get('/announcements/:id/attachment', requireAuth, async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
      const supabase = getSupabaseClient();
      const { data: ann, error } = await supabase
        .from('announcements')
        .select('id, target, attachment_name, attachment_type, attachment_data')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!ann || !ann.attachment_data) {
        res.status(404).json({ error: 'Documento anexo não encontrado.' });
        return;
      }

      const role = req.user?.role;
      const allowedByRole =
        role === 'admin' ||
        (role === 'educador' && ['todos', 'educadoras', 'professores'].includes(ann.target)) ||
        (role === 'pais' && ['todos', 'pais'].includes(ann.target));

      if (!allowedByRole) {
        res.status(403).json({ error: 'Sem permissão para aceder a este documento.' });
        return;
      }

      const match = String(ann.attachment_data).match(/^data:([a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/);
      if (!match || !ALLOWED_ANNOUNCEMENT_MIME_TYPES.has(match[1].toLowerCase())) {
        res.status(400).json({ error: 'Documento anexo inválido ou corrompido.' });
        return;
      }

      const fileBuffer = Buffer.from(match[2], 'base64');
      const safeName = sanitizeAnnouncementFilename(String(ann.attachment_name || 'circular-documento'));

      res.setHeader('Content-Type', match[1].toLowerCase());
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(fileBuffer);
    } catch (error) {
      sendDbError(res, error, 'Erro ao descarregar documento anexo.');
    }
  });

  router.patch('/admin/appointments/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status, notes } = req.body ?? {};
    try {
      const supabase = getSupabaseClient();
      const updates: Record<string, unknown> = {};
      if (['Agendada', 'Confirmada', 'Realizada', 'Cancelada'].includes(status)) updates.status = status;
      if (typeof notes === 'string') updates.notes = notes.trim();

      const { data, error } = await supabase
        .from('visit_appointments')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      res.json({ appointment: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao atualizar visita.');
    }
  });

  router.patch('/admin/authorizations/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    if (!['Aprovado', 'Pendente'].includes(status)) {
      res.status(400).json({ error: 'Estado inválido.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('pickup_authorizations')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      res.json({ authorization: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao atualizar autorização de retirada.');
    }
  });

  // ============================================================================
  // EDUCADORA (TIA) WORKSPACE ROUTES
  // ============================================================================
  router.get('/educator/workspace', requireAuth, requireRole(['educador', 'admin']), async (req: AuthRequest, res) => {
    const classroomParam = typeof req.query.classroom === 'string' ? req.query.classroom.trim() : '';
    const today = new Date().toISOString().split('T')[0];

    try {
      const supabase = getSupabaseClient();
      const [classesRes, studentsRes, attendanceRes, obsRes, lessonsRes, incidentsRes] = await Promise.all([
        supabase.from('classrooms').select('*').order('created_at', { ascending: true }),
        classroomParam
          ? supabase.from('students').select('*').eq('classroom_name', classroomParam).order('student_number', { ascending: true })
          : supabase.from('students').select('*').order('student_number', { ascending: true }),
        supabase.from('attendance_records').select('*').eq('attendance_date', today),
        classroomParam
          ? supabase.from('child_observations').select('*').eq('classroom_name', classroomParam).order('created_at', { ascending: false })
          : supabase.from('child_observations').select('*').order('created_at', { ascending: false }),
        classroomParam
          ? supabase.from('lesson_plans').select('*').eq('classroom_name', classroomParam).order('created_at', { ascending: false })
          : supabase.from('lesson_plans').select('*').order('created_at', { ascending: false }),
        supabase.from('pedagogical_incidents').select('*').order('created_at', { ascending: false })
      ]);

      for (const r of [classesRes, studentsRes, attendanceRes, obsRes, lessonsRes, incidentsRes]) {
        if (r.error) throw r.error;
      }

      res.json({
        classrooms: classesRes.data ?? [],
        students: studentsRes.data ?? [],
        attendanceRecords: attendanceRes.data ?? [],
        observations: obsRes.data ?? [],
        lessonPlans: lessonsRes.data ?? [],
        incidents: incidentsRes.data ?? []
      });
    } catch (error) {
      sendDbError(res, error, 'Erro ao carregar o espaço da Educadora (Tia).');
    }
  });

  router.post('/educator/attendance', requireAuth, requireRole(['educador', 'admin']), async (req: AuthRequest, res) => {
    const { studentId, studentNumber, studentName, classroomName, status, justification, markAllPresent } = req.body ?? {};
    const today = new Date().toISOString().split('T')[0];
    const recordedBy = formatEducatorNameServer(req.user?.name || 'Tia Educadora');

    try {
      const supabase = getSupabaseClient();

      if (markAllPresent && typeof classroomName === 'string' && classroomName.trim()) {
        const { data: classStudents, error: stErr } = await supabase
          .from('students')
          .select('id, student_number, name, classroom_name')
          .eq('classroom_name', classroomName.trim());

        if (stErr) throw stErr;
        if (!classStudents || classStudents.length === 0) {
          res.json({ records: [] });
          return;
        }

        const rows = classStudents.map((s) => ({
          student_id: s.id,
          student_number: s.student_number,
          student_name: s.name,
          classroom_name: s.classroom_name,
          attendance_date: today,
          status: 'Presente',
          justification: null,
          recorded_by: recordedBy
        }));

        const { data, error } = await supabase
          .from('attendance_records')
          .upsert(rows, { onConflict: 'student_name,classroom_name,attendance_date' })
          .select('*');

        if (error) throw error;
        res.json({ records: data ?? [] });
        return;
      }

      if (
        typeof studentName !== 'string' ||
        !studentName.trim() ||
        typeof classroomName !== 'string' ||
        !classroomName.trim() ||
        !['Presente', 'Ausente', 'Atrasado'].includes(status)
      ) {
        res.status(400).json({ error: 'Dados da chamada inválidos.' });
        return;
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(
          {
            student_id: typeof studentId === 'string' ? studentId : null,
            student_number: Number(studentNumber) || 1,
            student_name: studentName.trim(),
            classroom_name: classroomName.trim(),
            attendance_date: today,
            status,
            justification: typeof justification === 'string' && justification.trim() ? justification.trim() : null,
            recorded_by: recordedBy
          },
          { onConflict: 'student_name,classroom_name,attendance_date' }
        )
        .select('*')
        .single();

      if (error) throw error;
      res.json({ record: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao registar presença.');
    }
  });

  router.post('/educator/observations', requireAuth, requireRole(['educador', 'admin']), async (req: AuthRequest, res) => {
    const { studentId, studentNumber, studentName, classroomName, category, priority, title, text, notifiedParents } = req.body ?? {};
    const allowedCategories = [
      'Adaptação & Emoções',
      'Alimentação & Apetite',
      'Soninho & Repouso',
      'Desenvolvimento Motor',
      'Linguagem & Interação',
      'Saúde & Cuidados'
    ];
    const allowedPriorities = ['Rotina', 'Importante', 'Conquista / Marco'];

    if (
      typeof studentName !== 'string' ||
      !studentName.trim() ||
      typeof classroomName !== 'string' ||
      !classroomName.trim() ||
      !allowedCategories.includes(category) ||
      !allowedPriorities.includes(priority) ||
      typeof text !== 'string' ||
      !text.trim()
    ) {
      res.status(400).json({ error: 'Preencha todos os campos da observação sobre a criança.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const recordedBy = formatEducatorNameServer(req.user?.name || 'Tia Educadora');

      let resolvedStudentId: string | null = typeof studentId === 'string' && studentId.trim() ? studentId : null;
      let resolvedNumber = Number(studentNumber) || 1;
      if (!resolvedStudentId) {
        const { data: st } = await supabase
          .from('students')
          .select('id, student_number')
          .eq('name', studentName.trim())
          .maybeSingle();
        if (st) {
          resolvedStudentId = st.id;
          resolvedNumber = st.student_number;
        }
      }

      const { data, error } = await supabase
        .from('child_observations')
        .insert({
          student_id: resolvedStudentId,
          student_number: resolvedNumber,
          student_name: studentName.trim(),
          classroom_name: classroomName.trim(),
          category,
          priority,
          title: typeof title === 'string' && title.trim() ? title.trim() : `${category} • Registo da Tia`,
          text: text.trim(),
          recorded_by: recordedBy,
          notified_parents: notifiedParents !== false
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ observation: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao guardar observação.');
    }
  });

  router.delete('/educator/observations/:id', requireAuth, requireRole(['educador', 'admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('child_observations').delete().eq('id', id);
      if (error) throw error;
      res.json({ ok: true });
    } catch (error) {
      sendDbError(res, error, 'Erro ao remover observação.');
    }
  });

  router.post('/educator/lessons', requireAuth, requireRole(['educador', 'admin']), async (req: AuthRequest, res) => {
    const { classroomName, subject, title, lessonDate, timeSlot, room, summary } = req.body ?? {};
    if (
      typeof subject !== 'string' ||
      !subject.trim() ||
      typeof title !== 'string' ||
      !title.trim() ||
      typeof summary !== 'string' ||
      !summary.trim()
    ) {
      res.status(400).json({ error: 'Área lúdica, título e descrição da atividade são obrigatórios.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('lesson_plans')
        .insert({
          classroom_name: typeof classroomName === 'string' && classroomName.trim() ? classroomName.trim() : 'Geral',
          subject: subject.trim(),
          title: title.trim(),
          lesson_date: typeof lessonDate === 'string' && lessonDate.trim() ? lessonDate.trim() : 'Esta semana',
          time_slot: typeof timeSlot === 'string' && timeSlot.trim() ? timeSlot.trim() : '09:30 - 10:30',
          room: typeof room === 'string' && room.trim() ? room.trim() : 'Sala de Atividades',
          summary: summary.trim(),
          attachments: [],
          status: 'Planeada',
          created_by: formatEducatorNameServer(req.user?.name || 'Tia Educadora')
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ lesson: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao criar plano de atividades.');
    }
  });

  router.post('/educator/incidents', requireAuth, requireRole(['educador', 'admin']), async (req: AuthRequest, res) => {
    const { studentName, type, title, description, spoReferral, notifiedFamily, teacherNote } = req.body ?? {};
    if (
      typeof studentName !== 'string' ||
      !studentName.trim() ||
      !['Mérito Positivo', 'Apoio Socioemocional'].includes(type) ||
      typeof title !== 'string' ||
      !title.trim() ||
      typeof description !== 'string' ||
      !description.trim()
    ) {
      res.status(400).json({ error: 'Dados do registo pedagógico inválidos.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('pedagogical_incidents')
        .insert({
          student_name: studentName.trim(),
          type,
          title: title.trim(),
          description: description.trim(),
          incident_date: `Hoje às ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`,
          spo_referral: Boolean(spoReferral),
          notified_family: Boolean(notifiedFamily),
          teacher_note: typeof teacherNote === 'string' ? teacherNote.trim() : null,
          created_by: formatEducatorNameServer(req.user?.name || 'Tia Educadora')
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ incident: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao registar ocorrência pedagógica.');
    }
  });

  // ============================================================================
  // GUARDIAN (PAIS / ENCARREGADOS) WORKSPACE ROUTES
  // ============================================================================
  router.get('/guardian/workspace', requireAuth, requireRole(['pais', 'admin']), async (req: AuthRequest, res) => {
    try {
      const supabase = getSupabaseClient();
      const isAdmin = req.user?.role === 'admin';
      const userId = req.user?.id || '';

      const studentsQuery = supabase.from('students').select('*').order('student_number', { ascending: true });
      const { data: children, error: childErr } = isAdmin
        ? await studentsQuery
        : await studentsQuery.eq('guardian_user_id', userId);

      if (childErr) throw childErr;
      const childIds = (children ?? []).map((c) => c.id);

      const [routineRes, obsRes, financeRes, messagesRes, consentsRes, pickupsRes, announcementsRes] =
        await Promise.all([
          childIds.length > 0
            ? supabase.from('routine_logs').select('*').in('student_id', childIds).order('created_at', { ascending: false })
            : Promise.resolve({ data: [], error: null }),
          childIds.length > 0
            ? supabase
                .from('child_observations')
                .select('*')
                .in('student_id', childIds)
                .eq('notified_parents', true)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [], error: null }),
          isAdmin
            ? supabase.from('financial_records').select('*').order('created_at', { ascending: false })
            : supabase.from('financial_records').select('*').eq('guardian_user_id', userId).order('created_at', { ascending: false }),
          isAdmin
            ? supabase.from('portal_messages').select('*').order('created_at', { ascending: false })
            : supabase.from('portal_messages').select('*').eq('guardian_user_id', userId).order('created_at', { ascending: false }),
          isAdmin
            ? supabase.from('digital_consents').select('*').order('created_at', { ascending: false })
            : supabase.from('digital_consents').select('*').eq('guardian_user_id', userId).order('created_at', { ascending: false }),
          isAdmin
            ? supabase.from('pickup_authorizations').select('*').order('created_at', { ascending: false })
            : supabase.from('pickup_authorizations').select('*').eq('guardian_user_id', userId).order('created_at', { ascending: false }),
          supabase.from('announcements').select('*').in('target', ['todos', 'pais']).order('created_at', { ascending: false })
        ]);

      for (const r of [routineRes, obsRes, financeRes, messagesRes, consentsRes, pickupsRes, announcementsRes]) {
        if (r.error) throw r.error;
      }

      res.json({
        children: children ?? [],
        routineLogs: routineRes.data ?? [],
        observations: obsRes.data ?? [],
        financialRecords: financeRes.data ?? [],
        messages: messagesRes.data ?? [],
        consents: consentsRes.data ?? [],
        pickupAuthorizations: pickupsRes.data ?? [],
        announcements: (announcementsRes.data ?? []).map((a) => stripAnnouncementAttachmentData(a))
      });
    } catch (error) {
      sendDbError(res, error, 'Erro ao carregar o portal dos encarregados.');
    }
  });

  router.post('/guardian/authorizations', requireAuth, requireRole(['pais', 'admin']), async (req: AuthRequest, res) => {
    const { studentId, personName, relationship, documentId, phone, authDate, timeLimit } = req.body ?? {};
    if (
      typeof personName !== 'string' ||
      !personName.trim() ||
      typeof relationship !== 'string' ||
      !relationship.trim() ||
      typeof documentId !== 'string' ||
      !documentId.trim()
    ) {
      res.status(400).json({ error: 'Preencha os dados da pessoa autorizada.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (req.user?.role === 'pais' && typeof studentId === 'string' && studentId.trim()) {
        const { data: st } = await supabase
          .from('students')
          .select('guardian_user_id')
          .eq('id', studentId)
          .maybeSingle();
        if (st && st.guardian_user_id !== req.user.id) {
          res.status(403).json({ error: 'Sem permissão para esta criança.' });
          return;
        }
      }

      const { data, error } = await supabase
        .from('pickup_authorizations')
        .insert({
          student_id: typeof studentId === 'string' && studentId.trim() ? studentId : null,
          guardian_user_id: req.user?.id || null,
          person_name: personName.trim(),
          relationship: relationship.trim(),
          document_id: documentId.trim(),
          phone: typeof phone === 'string' ? phone.trim() : '',
          auth_date: typeof authDate === 'string' && authDate.trim() ? authDate.trim() : new Date().toLocaleDateString('pt-PT'),
          time_limit: typeof timeLimit === 'string' && timeLimit.trim() ? timeLimit.trim() : '18:30',
          status: 'Pendente'
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ authorization: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao registar autorização de retirada.');
    }
  });

  router.post('/guardian/consents/:id/sign', requireAuth, requireRole(['pais', 'admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { pin } = req.body ?? {};
    if (typeof pin !== 'string' || pin.trim().length < 4) {
      res.status(400).json({ error: 'Insira um código PIN de pelo menos 4 dígitos.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: consent, error: fetchErr } = await supabase
        .from('digital_consents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!consent) {
        res.status(404).json({ error: 'Consentimento não encontrado.' });
        return;
      }
      if (req.user?.role === 'pais' && consent.guardian_user_id && consent.guardian_user_id !== req.user.id) {
        res.status(403).json({ error: 'Sem permissão para assinar este documento.' });
        return;
      }

      const signatureHash = `sha256-${crypto
        .createHash('sha256')
        .update(`${id}:${req.user?.id}:${Date.now()}`)
        .digest('hex')
        .slice(0, 24)}`;

      const { data: updated, error: updErr } = await supabase
        .from('digital_consents')
        .update({
          signed: true,
          signer: `${req.user?.name || 'Encarregado'} (PIN Validado)`,
          signature_hash: signatureHash,
          signed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updErr) throw updErr;
      res.json({ consent: updated });
    } catch (error) {
      sendDbError(res, error, 'Erro ao assinar autorização.');
    }
  });

  router.post('/guardian/messages', requireAuth, requireRole(['pais', 'admin']), async (req: AuthRequest, res) => {
    const { studentId, recipientName, subject, message } = req.body ?? {};
    if (
      typeof recipientName !== 'string' ||
      !recipientName.trim() ||
      typeof subject !== 'string' ||
      !subject.trim() ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      res.status(400).json({ error: 'Destinatário, assunto e mensagem são obrigatórios.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('portal_messages')
        .insert({
          student_id: typeof studentId === 'string' && studentId.trim() ? studentId : null,
          guardian_user_id: req.user?.id || null,
          sender_role: 'Encarregado de Educação',
          sender_name: req.user?.name || 'Encarregado',
          recipient_name: recipientName.trim(),
          subject: subject.trim(),
          preview: message.trim(),
          unread: false
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json({ message: data });
    } catch (error) {
      sendDbError(res, error, 'Erro ao enviar mensagem.');
    }
  });

  router.post('/guardian/payments/:id/pay', requireAuth, requireRole(['pais', 'admin']), async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { method } = req.body ?? {};
    try {
      const supabase = getSupabaseClient();
      const { data: rec, error: fetchErr } = await supabase
        .from('financial_records')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!rec) {
        res.status(404).json({ error: 'Fatura não encontrada.' });
        return;
      }
      if (req.user?.role === 'pais' && rec.guardian_user_id && rec.guardian_user_id !== req.user.id) {
        res.status(403).json({ error: 'Sem permissão para liquidar esta fatura.' });
        return;
      }

      const { data: updated, error: updErr } = await supabase
        .from('financial_records')
        .update({
          status: 'Liquidado',
          payment_method: typeof method === 'string' && method.trim() ? method.trim() : 'Multicaixa Express (MCX)',
          paid_date: new Date().toLocaleDateString('pt-PT')
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updErr) throw updErr;
      res.json({ record: updated });
    } catch (error) {
      sendDbError(res, error, 'Erro ao registar pagamento.');
    }
  });

  return router;
}
