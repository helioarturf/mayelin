import type { AgeGroup, ShiftType, UserRole } from '../types';

export type ServerRole = 'admin' | 'educador' | 'pais';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: ServerRole;
  title: string;
  avatarLetter: string;
  nif?: string;
}

export interface AuthStatusResponse {
  supabaseConfigured: boolean;
  schemaReady: boolean;
  needsInitialSetup: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface DbClassroom {
  id: string;
  name: string;
  cycle: string;
  capacity: number;
  enrolled: number;
  ratio: string;
  lead_teacher: string;
  subjects: string[];
  room: string;
  schedule: string;
  created_at: string;
}

export interface DbStudent {
  id: string;
  student_number: number;
  name: string;
  classroom_id: string | null;
  classroom_name: string;
  cycle: string;
  age: string;
  avatar_letter: string;
  status: 'Presente' | 'Em atividade' | 'Alimentação' | 'Soneca' | 'Entregue';
  guardian_user_id: string | null;
  responsible_name: string;
  teacher_name: string;
  allergies: string[];
  medications: string[];
  presence_rate: number;
  development_status: string;
  financial_status: 'Regularizada' | 'Pendente';
  created_at: string;
}

export interface DbStaffMember {
  id: string;
  name: string;
  email: string;
  role: ServerRole;
  title: string;
  avatar_letter: string;
  nif: string | null;
  phone: string | null;
  access_level: string;
  department: string;
  two_factor_enabled: boolean;
  status: 'Ativo' | 'Revogado';
  last_access: string;
  created_at: string;
}

export interface DbFinancialRecord {
  id: string;
  student_id: string | null;
  guardian_user_id: string | null;
  student_name: string;
  guardian_name: string;
  nif: string;
  class_group: string;
  description: string;
  amount: number;
  payment_method: string;
  status: 'Liquidado' | 'Pendente' | 'Aviso Enviado';
  invoice_number: string;
  due_date: string;
  paid_date: string | null;
  factplus_reference?: string | null;
  factplus_status?: string | null;
  factplus_validated_at?: string | null;
  factplus_message?: string | null;
  created_at: string;
}

export interface FactPlusStatusResponse {
  configured: boolean;
  apiUrl: string;
}

export interface FiscalValidationCheck {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface FactPlusValidationResponse {
  valid: boolean;
  configured: boolean;
  mode: 'create' | 'view' | 'local-check' | 'local-only';
  reference: string | null;
  factplusStatus: string;
  message: string;
  checks: FiscalValidationCheck[];
  schemaColumnWarning?: boolean;
  record: DbFinancialRecord;
}

export interface FactPlusVerifyReferenceResponse {
  valid: boolean;
  reference: string;
  statusText: string | null;
  message: string;
  record: DbFinancialRecord | null;
}

export interface DbAnnouncement {
  id: string;
  title: string;
  content: string;
  channels: string[];
  target: 'todos' | 'pais' | 'educadoras' | 'professores';
  priority: 'normal' | 'importante' | 'urgente';
  author: string;
  open_rate: number;
  recipient_count: number;
  authorizations_required: boolean;
  authorizations_signed_count: number;
  authorizations_total: number;
  status: string;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
  created_at: string;
}

export interface AnnouncementAttachmentPayload {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface DbVisitAppointment {
  id: string;
  age_group: AgeGroup;
  shift: ShiftType;
  parent_name: string;
  child_name: string;
  whatsapp: string;
  email: string;
  visit_date: string;
  visit_time: string;
  notes: string | null;
  status: 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada';
  created_at: string;
}

export interface DbPickupAuthorization {
  id: string;
  student_id: string | null;
  guardian_user_id: string | null;
  person_name: string;
  relationship: string;
  document_id: string;
  phone: string;
  auth_date: string;
  time_limit: string;
  status: 'Aprovado' | 'Pendente';
  created_at: string;
}

export interface DbAttendanceRecord {
  id: string;
  student_id: string | null;
  student_number: number;
  student_name: string;
  classroom_name: string;
  attendance_date: string;
  status: 'Presente' | 'Ausente' | 'Atrasado';
  justification: string | null;
  recorded_by: string;
  created_at: string;
}

export type ObservationCategory =
  | 'Adaptação & Emoções'
  | 'Alimentação & Apetite'
  | 'Soninho & Repouso'
  | 'Desenvolvimento Motor'
  | 'Linguagem & Interação'
  | 'Saúde & Cuidados';

export type ObservationPriority = 'Rotina' | 'Importante' | 'Conquista / Marco';

export interface DbChildObservation {
  id: string;
  student_id: string | null;
  student_number: number;
  student_name: string;
  classroom_name: string;
  category: ObservationCategory;
  priority: ObservationPriority;
  title: string;
  text: string;
  recorded_by: string;
  notified_parents: boolean;
  created_at: string;
}

export interface DbLessonPlan {
  id: string;
  classroom_name: string;
  subject: string;
  title: string;
  lesson_date: string;
  time_slot: string;
  room: string;
  summary: string;
  attachments: { name: string; type: string; size: string }[];
  status: 'Planeada' | 'Lecionada' | 'Em Curso';
  created_by: string;
  created_at: string;
}

export interface DbPedagogicalIncident {
  id: string;
  student_name: string;
  type: 'Mérito Positivo' | 'Apoio Socioemocional';
  title: string;
  description: string;
  incident_date: string;
  spo_referral: boolean;
  notified_family: boolean;
  teacher_note: string | null;
  created_by: string;
  created_at: string;
}

export interface DbDigitalConsent {
  id: string;
  student_id: string | null;
  guardian_user_id: string | null;
  title: string;
  event_date: string;
  transport: string;
  meal: string;
  medical_check: string;
  signed: boolean;
  signer: string | null;
  signature_hash: string | null;
  signed_at: string | null;
  created_at: string;
}

export interface DbPortalMessage {
  id: string;
  student_id: string | null;
  guardian_user_id: string | null;
  sender_role: string;
  sender_name: string;
  recipient_name: string;
  subject: string;
  preview: string;
  unread: boolean;
  created_at: string;
}

export interface DbRoutineLog {
  id: string;
  student_id: string | null;
  day_label: string;
  entry_info: string;
  meal_info: string;
  activity_info: string;
  created_at: string;
}

export interface AdminOverviewResponse {
  classrooms: DbClassroom[];
  financialRecords: DbFinancialRecord[];
  staffList: DbStaffMember[];
  announcements: DbAnnouncement[];
  appointments: DbVisitAppointment[];
  students: DbStudent[];
  pickupAuthorizations: DbPickupAuthorization[];
}

export interface EducatorWorkspaceResponse {
  classrooms: DbClassroom[];
  students: DbStudent[];
  attendanceRecords: DbAttendanceRecord[];
  observations: DbChildObservation[];
  lessonPlans: DbLessonPlan[];
  incidents: DbPedagogicalIncident[];
}

export interface GuardianWorkspaceResponse {
  children: DbStudent[];
  routineLogs: DbRoutineLog[];
  observations: DbChildObservation[];
  financialRecords: DbFinancialRecord[];
  messages: DbPortalMessage[];
  consents: DbDigitalConsent[];
  pickupAuthorizations: DbPickupAuthorization[];
  announcements: DbAnnouncement[];
}

export function normalizePortalRole(role?: UserRole | string): ServerRole {
  if (role === 'admin') return 'admin';
  if (role === 'educador' || role === 'professor') return 'educador';
  return 'pais';
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(path, {
    ...options,
    headers
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (data && typeof data.error === 'string' && data.error) ||
      `Erro na comunicação com o servidor (${res.status}).`;
    throw new Error(message);
  }

  if (!isJson || data === null) {
    throw new Error('O servidor da API não devolveu JSON válido. Verifique se as rotas /api estão ativas.');
  }

  return data as T;
}

export const portalApi = {
  getAuthStatus(): Promise<AuthStatusResponse> {
    return apiRequest<AuthStatusResponse>('/api/auth/status');
  },

  setupInitialAdmin(payload: {
    name: string;
    email: string;
    password: string;
    nif?: string;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  login(payload: {
    identifier: string;
    password: string;
    role?: UserRole;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: payload.identifier,
        password: payload.password,
        role: payload.role ? normalizePortalRole(payload.role) : undefined
      })
    });
  },

  createAppointment(payload: {
    ageGroup: AgeGroup;
    shift: ShiftType;
    parentName: string;
    childName: string;
    whatsapp: string;
    email: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<{ appointment: DbVisitAppointment }> {
    return apiRequest<{ appointment: DbVisitAppointment }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Admin
  getAdminOverview(token: string): Promise<AdminOverviewResponse> {
    return apiRequest<AdminOverviewResponse>('/api/admin/overview', {}, token);
  },

  createClassroom(
    token: string,
    payload: {
      name: string;
      cycle: string;
      capacity: number;
      leadTeacher: string;
      room?: string;
      schedule?: string;
      ratio?: string;
    }
  ): Promise<{ classroom: DbClassroom }> {
    return apiRequest<{ classroom: DbClassroom }>(
      '/api/admin/classrooms',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  createStaff(
    token: string,
    payload: {
      name: string;
      email: string;
      password: string;
      accessRole: string;
      nif?: string;
      phone?: string;
    }
  ): Promise<{ staff: DbStaffMember }> {
    return apiRequest<{ staff: DbStaffMember }>(
      '/api/admin/staff',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  updateStaffStatus(
    token: string,
    id: string,
    status: 'Ativo' | 'Revogado'
  ): Promise<{ staff: DbStaffMember }> {
    return apiRequest<{ staff: DbStaffMember }>(
      `/api/admin/staff/${encodeURIComponent(id)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token
    );
  },

  createStudent(
    token: string,
    payload: {
      name: string;
      classroomName: string;
      age: string;
      responsibleName: string;
      guardianEmail?: string;
      allergies?: string[];
      medications?: string[];
    }
  ): Promise<{ student: DbStudent }> {
    return apiRequest<{ student: DbStudent }>(
      '/api/admin/students',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  createFinancialRecord(
    token: string,
    payload: {
      studentId?: string;
      studentName: string;
      guardianName: string;
      nif: string;
      classGroup: string;
      description: string;
      amount: number;
      paymentMethod: string;
      dueDate: string;
      status: 'Liquidado' | 'Pendente' | 'Aviso Enviado';
    }
  ): Promise<{ record: DbFinancialRecord }> {
    return apiRequest<{ record: DbFinancialRecord }>(
      '/api/admin/financial',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  updateFinancialStatus(
    token: string,
    id: string,
    status: 'Liquidado' | 'Pendente' | 'Aviso Enviado'
  ): Promise<{ record: DbFinancialRecord }> {
    return apiRequest<{ record: DbFinancialRecord }>(
      `/api/admin/financial/${encodeURIComponent(id)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token
    );
  },

  getFactPlusStatus(token: string): Promise<FactPlusStatusResponse> {
    return apiRequest<FactPlusStatusResponse>('/api/admin/factplus/status', {}, token);
  },

  validateInvoiceFactPlus(
    token: string,
    id: string,
    payload?: { reference?: string; docType?: 'factura' | 'factura-recibo' | 'proforma' }
  ): Promise<FactPlusValidationResponse> {
    return apiRequest<FactPlusValidationResponse>(
      `/api/admin/financial/${encodeURIComponent(id)}/validate-factplus`,
      { method: 'POST', body: JSON.stringify(payload ?? {}) },
      token
    );
  },

  verifyFactPlusReference(
    token: string,
    payload: {
      reference: string;
      docType?: 'factura' | 'factura-recibo' | 'proforma' | 'nota-credito' | 'nota-debito';
      financialRecordId?: string;
    }
  ): Promise<FactPlusVerifyReferenceResponse> {
    return apiRequest<FactPlusVerifyReferenceResponse>(
      '/api/admin/factplus/verify-reference',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  createAnnouncement(
    token: string,
    payload: {
      title: string;
      content: string;
      channels: string[];
      target: 'todos' | 'pais' | 'educadoras';
      priority: 'normal' | 'importante' | 'urgente';
      authorizationsRequired: boolean;
      attachment?: AnnouncementAttachmentPayload | null;
    }
  ): Promise<{ announcement: DbAnnouncement; schemaColumnWarning?: boolean }> {
    return apiRequest<{ announcement: DbAnnouncement; schemaColumnWarning?: boolean }>(
      '/api/admin/announcements',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  async downloadAnnouncementAttachment(token: string, id: string, fallbackName?: string | null): Promise<void> {
    const res = await fetch(`/api/announcements/${encodeURIComponent(id)}/attachment`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const errData = isJson ? await res.json().catch(() => null) : null;
      throw new Error(
        (errData && typeof errData.error === 'string' && errData.error) ||
          `Não foi possível descarregar o documento (${res.status}).`
      );
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fallbackName || 'circular-documento';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  updateAppointmentStatus(
    token: string,
    id: string,
    status: 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada'
  ): Promise<{ appointment: DbVisitAppointment }> {
    return apiRequest<{ appointment: DbVisitAppointment }>(
      `/api/admin/appointments/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token
    );
  },

  updateAuthorizationStatus(
    token: string,
    id: string,
    status: 'Aprovado' | 'Pendente'
  ): Promise<{ authorization: DbPickupAuthorization }> {
    return apiRequest<{ authorization: DbPickupAuthorization }>(
      `/api/admin/authorizations/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token
    );
  },

  // Educadora (Tia)
  getEducatorWorkspace(token: string, classroom?: string): Promise<EducatorWorkspaceResponse> {
    const query = classroom ? `?classroom=${encodeURIComponent(classroom)}` : '';
    return apiRequest<EducatorWorkspaceResponse>(`/api/educator/workspace${query}`, {}, token);
  },

  saveAttendance(
    token: string,
    payload: {
      studentId?: string;
      studentNumber?: number;
      studentName?: string;
      classroomName: string;
      status?: 'Presente' | 'Ausente' | 'Atrasado';
      justification?: string;
      markAllPresent?: boolean;
    }
  ): Promise<{ record?: DbAttendanceRecord; records?: DbAttendanceRecord[] }> {
    return apiRequest<{ record?: DbAttendanceRecord; records?: DbAttendanceRecord[] }>(
      '/api/educator/attendance',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  createObservation(
    token: string,
    payload: {
      studentId?: string;
      studentNumber?: number;
      studentName: string;
      classroomName: string;
      category: ObservationCategory;
      priority: ObservationPriority;
      title?: string;
      text: string;
      notifiedParents: boolean;
    }
  ): Promise<{ observation: DbChildObservation }> {
    return apiRequest<{ observation: DbChildObservation }>(
      '/api/educator/observations',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  deleteObservation(token: string, id: string): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(
      `/api/educator/observations/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      token
    );
  },

  createLessonPlan(
    token: string,
    payload: {
      classroomName: string;
      subject: string;
      title: string;
      lessonDate: string;
      timeSlot: string;
      room?: string;
      summary: string;
    }
  ): Promise<{ lesson: DbLessonPlan }> {
    return apiRequest<{ lesson: DbLessonPlan }>(
      '/api/educator/lessons',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  createIncident(
    token: string,
    payload: {
      studentName: string;
      type: 'Mérito Positivo' | 'Apoio Socioemocional';
      title: string;
      description: string;
      spoReferral: boolean;
      notifiedFamily: boolean;
      teacherNote?: string;
    }
  ): Promise<{ incident: DbPedagogicalIncident }> {
    return apiRequest<{ incident: DbPedagogicalIncident }>(
      '/api/educator/incidents',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  // Guardian (Pais)
  getGuardianWorkspace(token: string): Promise<GuardianWorkspaceResponse> {
    return apiRequest<GuardianWorkspaceResponse>('/api/guardian/workspace', {}, token);
  },

  createPickupAuthorization(
    token: string,
    payload: {
      studentId?: string;
      personName: string;
      relationship: string;
      documentId: string;
      phone?: string;
      authDate?: string;
      timeLimit?: string;
    }
  ): Promise<{ authorization: DbPickupAuthorization }> {
    return apiRequest<{ authorization: DbPickupAuthorization }>(
      '/api/guardian/authorizations',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  signConsent(token: string, id: string, pin: string): Promise<{ consent: DbDigitalConsent }> {
    return apiRequest<{ consent: DbDigitalConsent }>(
      `/api/guardian/consents/${encodeURIComponent(id)}/sign`,
      { method: 'POST', body: JSON.stringify({ pin }) },
      token
    );
  },

  sendGuardianMessage(
    token: string,
    payload: {
      studentId?: string;
      recipientName: string;
      subject: string;
      message: string;
    }
  ): Promise<{ message: DbPortalMessage }> {
    return apiRequest<{ message: DbPortalMessage }>(
      '/api/guardian/messages',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  },

  payInvoice(token: string, id: string, method?: string): Promise<{ record: DbFinancialRecord }> {
    return apiRequest<{ record: DbFinancialRecord }>(
      `/api/guardian/payments/${encodeURIComponent(id)}/pay`,
      { method: 'POST', body: JSON.stringify({ method }) },
      token
    );
  }
};
