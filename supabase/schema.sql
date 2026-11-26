-- ============================================================================
-- Jardim Escola da Mayelin - Schema Completo Supabase (PostgreSQL)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Utilizadores do Portal (Administração, Educadoras "Tias", Pais/Encarregados, Portaria, SPO)
create table if not exists public.portal_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'educador', 'pais')),
  title text not null,
  avatar_letter text not null default 'U',
  nif text,
  phone text,
  access_level text not null default 'Educadora (Tia)',
  department text not null default 'Corpo de Educadoras (Tias)',
  two_factor_enabled boolean not null default true,
  status text not null default 'Ativo' check (status in ('Ativo', 'Revogado')),
  last_access text not null default 'Nunca acedeu',
  created_at timestamptz not null default now()
);

-- 2. Turmas & Salas da Creche e Jardim de Infância
create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  cycle text not null,
  capacity integer not null default 18 check (capacity > 0),
  enrolled integer not null default 0 check (enrolled >= 0),
  ratio text not null default '1:5 (Tia Educadora + Auxiliar)',
  lead_teacher text not null,
  subjects text[] not null default '{}',
  room text not null,
  schedule text not null default '07:30 - 18:30 (Integral/Semi)',
  created_at timestamptz not null default now()
);

-- 3. Crianças / Alunos Matriculados
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_number integer not null,
  name text not null,
  classroom_id uuid references public.classrooms(id) on delete set null,
  classroom_name text not null,
  cycle text not null default 'Pré-Escolar & Jardim de Infância',
  age text not null,
  avatar_letter text not null default 'C',
  status text not null default 'Presente' check (status in ('Presente', 'Em atividade', 'Alimentação', 'Soneca', 'Entregue')),
  guardian_user_id uuid references public.portal_users(id) on delete set null,
  responsible_name text not null,
  teacher_name text not null,
  allergies text[] not null default '{}',
  medications text[] not null default '{}',
  presence_rate numeric(5,2) not null default 100.00,
  development_status text not null default 'Acompanhamento Contínuo',
  financial_status text not null default 'Regularizada' check (financial_status in ('Regularizada', 'Pendente')),
  created_at timestamptz not null default now()
);

-- 4. Registos de Chamada & Assiduidade Diária
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  student_number integer not null,
  student_name text not null,
  classroom_name text not null,
  attendance_date date not null default current_date,
  status text not null check (status in ('Presente', 'Ausente', 'Atrasado')),
  justification text,
  recorded_by text not null,
  created_at timestamptz not null default now(),
  unique (student_name, classroom_name, attendance_date)
);

-- 5. Observações Importantes da Educadora (Tia) sobre cada Criança (Sem notas numéricas)
create table if not exists public.child_observations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  student_number integer not null,
  student_name text not null,
  classroom_name text not null,
  category text not null check (
    category in (
      'Adaptação & Emoções',
      'Alimentação & Apetite',
      'Soninho & Repouso',
      'Desenvolvimento Motor',
      'Linguagem & Interação',
      'Saúde & Cuidados'
    )
  ),
  priority text not null check (priority in ('Rotina', 'Importante', 'Conquista / Marco')),
  title text not null default 'Observação da Educadora',
  text text not null,
  recorded_by text not null,
  notified_parents boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Planos de Atividades & Sessões Lúdicas
create table if not exists public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  classroom_name text not null,
  subject text not null,
  title text not null,
  lesson_date text not null,
  time_slot text not null,
  room text not null,
  summary text not null,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'Planeada' check (status in ('Planeada', 'Lecionada', 'Em Curso')),
  created_by text not null,
  created_at timestamptz not null default now()
);

-- 7. Ocorrências Pedagógicas e Apoio Socioemocional
create table if not exists public.pedagogical_incidents (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  type text not null check (type in ('Mérito Positivo', 'Apoio Socioemocional')),
  title text not null,
  description text not null,
  incident_date text not null,
  spo_referral boolean not null default false,
  notified_family boolean not null default true,
  teacher_note text,
  created_by text not null,
  created_at timestamptz not null default now()
);

-- 8. Registos Financeiros (Propinas em Kwanza - Kz)
create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete set null,
  guardian_user_id uuid references public.portal_users(id) on delete set null,
  student_name text not null,
  guardian_name text not null,
  nif text not null,
  class_group text not null,
  description text not null default 'Mensalidade Escolar',
  amount numeric(14,2) not null check (amount >= 0),
  payment_method text not null default 'Multicaixa Express (MCX)',
  status text not null default 'Pendente' check (status in ('Liquidado', 'Pendente', 'Aviso Enviado')),
  invoice_number text not null unique,
  due_date text not null,
  paid_date text,
  factplus_reference text,
  factplus_status text,
  factplus_validated_at timestamptz,
  factplus_message text,
  created_at timestamptz not null default now()
);

-- 9. Circulares e Comunicações Oficiais
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  channels text[] not null default '{App Push,E-mail}',
  target text not null default 'todos' check (target in ('todos', 'pais', 'educadoras', 'professores')),
  priority text not null default 'normal' check (priority in ('normal', 'importante', 'urgente')),
  author text not null,
  open_rate numeric(5,2) not null default 100.00,
  recipient_count integer not null default 0,
  authorizations_required boolean not null default false,
  authorizations_signed_count integer not null default 0,
  authorizations_total integer not null default 0,
  status text not null default 'Enviada',
  created_at timestamptz not null default now()
);

-- 10. Autorizações de Retirada (Portaria)
create table if not exists public.pickup_authorizations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  guardian_user_id uuid references public.portal_users(id) on delete set null,
  person_name text not null,
  relationship text not null,
  document_id text not null,
  phone text not null,
  auth_date text not null,
  time_limit text not null,
  status text not null default 'Pendente' check (status in ('Aprovado', 'Pendente')),
  created_at timestamptz not null default now()
);

-- 11. Consentimentos Digitais (Saídas Pedagógicas e Eventos)
create table if not exists public.digital_consents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  guardian_user_id uuid references public.portal_users(id) on delete set null,
  title text not null,
  event_date text not null,
  transport text not null,
  meal text not null,
  medical_check text not null,
  signed boolean not null default false,
  signer text,
  signature_hash text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 12. Mensagens entre Famílias e Equipa Pedagógica
create table if not exists public.portal_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  guardian_user_id uuid references public.portal_users(id) on delete set null,
  sender_role text not null,
  sender_name text not null,
  recipient_name text not null,
  subject text not null,
  preview text not null,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

-- 13. Agendamentos de Visitas (Website Público)
create table if not exists public.visit_appointments (
  id uuid primary key default gen_random_uuid(),
  age_group text not null check (age_group in ('bercario', 'maternal', 'jardim')),
  shift text not null check (shift in ('matutino', 'vespertino', 'integral')),
  parent_name text not null,
  child_name text not null,
  whatsapp text not null,
  email text not null,
  visit_date text not null,
  visit_time text not null,
  notes text,
  status text not null default 'Agendada' check (status in ('Agendada', 'Confirmada', 'Realizada', 'Cancelada')),
  created_at timestamptz not null default now()
);

-- 14. Registos de Rotina Diária (Entrada, Refeição, Atividade)
create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  day_label text not null,
  entry_info text not null,
  meal_info text not null,
  activity_info text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Índices de Performance
-- ============================================================================
create index if not exists idx_students_classroom on public.students(classroom_name);
create index if not exists idx_students_guardian on public.students(guardian_user_id);
create index if not exists idx_observations_student on public.child_observations(student_name);
create index if not exists idx_observations_classroom on public.child_observations(classroom_name);
create index if not exists idx_attendance_date_class on public.attendance_records(attendance_date, classroom_name);
create index if not exists idx_financial_guardian on public.financial_records(guardian_user_id);
create index if not exists idx_appointments_date on public.visit_appointments(visit_date);

-- ============================================================================
-- Row Level Security (RLS)
-- Ativado em todas as tabelas; o servidor backend autenticado utiliza a
-- chave service_role com controlo rigoroso por utilizador e perfil (RBAC).
-- ============================================================================
alter table public.portal_users enable row level security;
alter table public.classrooms enable row level security;
alter table public.students enable row level security;
alter table public.attendance_records enable row level security;
alter table public.child_observations enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.pedagogical_incidents enable row level security;
alter table public.financial_records enable row level security;
alter table public.announcements enable row level security;
alter table public.pickup_authorizations enable row level security;
alter table public.digital_consents enable row level security;
alter table public.portal_messages enable row level security;
alter table public.visit_appointments enable row level security;
alter table public.routine_logs enable row level security;

-- ============================================================================
-- Migração incremental para integração FactPlus (AGT) em bases existentes
-- ============================================================================
alter table public.financial_records add column if not exists factplus_reference text;
alter table public.financial_records add column if not exists factplus_status text;
alter table public.financial_records add column if not exists factplus_validated_at timestamptz;
alter table public.financial_records add column if not exists factplus_message text;
