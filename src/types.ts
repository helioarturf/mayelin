export type AgeGroup = 'bercario' | 'maternal' | 'jardim';

export type ShiftType = 'matutino' | 'vespertino' | 'integral';

export interface Classroom {
  id: AgeGroup;
  title: string;
  ageRange: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  accentColor: string;
  description: string;
  features: string[];
  shifts: string[];
}

export interface Facility {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  image: string;
  alt: string;
  description: string;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  iconName: string;
  bgClass: string;
  textClass: string;
}

export interface DailyLogItem {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'meal' | 'nap' | 'activity' | 'hygiene' | 'health';
  icon: string;
  colorClass: string;
  bgClass: string;
}

export interface Student {
  id: string;
  name: string;
  classroom: string;
  age: string;
  avatarLetter: string;
  status: 'Presente' | 'Em atividade' | 'Alimentação' | 'Soneca' | 'Entregue';
  responsibleName: string;
  teacherName: string;
  allergies: string[];
  medications: string[];
  dailyLogs: DailyLogItem[];
  photos: {
    id: string;
    url: string;
    caption: string;
    time: string;
  }[];
}

export interface PickupAuthorization {
  id: string;
  personName: string;
  relationship: string;
  documentId: string;
  phone: string;
  date: string;
  timeLimit: string;
  status: 'Aprovado' | 'Pendente';
  createdAt: string;
}

export interface VisitAppointment {
  id: string;
  ageGroup: AgeGroup;
  shift: ShiftType;
  parentName: string;
  childName: string;
  whatsapp: string;
  email: string;
  date: string;
  time: string;
  notes?: string;
  createdAt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface Testimonial {
  id: string;
  parentName: string;
  childInfo: string;
  badge: string;
  badgeColor: string;
  quote: string;
  rating: number;
}

export type UserRole = 'admin' | 'professor' | 'educador' | 'pais';

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  target: 'todos' | 'pais' | 'educadoras' | 'professores';
  priority: 'normal' | 'importante' | 'urgente';
  author: string;
}

export interface UserProfileInfo {
  role: UserRole;
  label: string;
  name: string;
  description: string;
  avatarBadge: string;
}

// =============================================================================
// REGIME DA FACTURA ELECTRÓNICA & GESTÃO FISCAL AGT (ANGOLA)
// =============================================================================
export type InvoiceType = 'FE' | 'FRE' | 'NCE' | 'NDE' | 'FT' | 'FR' | 'FP' | 'RC';
export type InvoiceStatus = 'Emitida' | 'Liquidada' | 'Aviso Enviado' | 'Em Aberto' | 'Anulada';
export type ElectronicTransmissionStatus = 'Validada_AGT' | 'Contingencia' | 'Rejeitada' | 'Pendente_Envio';

export interface InvoiceItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxRate: number;
  exemptionReasonCode?: string; // Ex: 'M02' (Isento Artigo 12.º do CIVA)
  totalItem: number;
}

export interface ElectronicInvoiceMetadata {
  isElectronic: boolean;
  cvaCode?: string; // Código de Validação da AGT (ex: 'AGT-2025-CVA-98412')
  transmissionStatus: ElectronicTransmissionStatus;
  transmissionTimestamp?: string;
  rejectionReason?: string;
  isContingency: boolean;
  contingencyJustification?: string;
  xmlPayload?: string;
  qrCodeUrl?: string;
}

export interface Invoice {
  id: string;
  documentType: InvoiceType;
  invoiceNumber: string; // Ex: 'FE MAY2025/0045'
  series: string; // Ex: 'MAY2025'
  sequenceNumber: number;
  issueDate: string;
  dueDate: string;

  // Dados do Adquirente e Educando
  studentId: string;
  studentName: string;
  classroom: string;
  guardianName: string;
  guardianNif: string; // NIF ou '999999999'
  guardianEmail?: string;
  guardianPhone?: string;
  guardianAddress?: string;

  // Itens e Totais
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxTotal: number;
  totalAmount: number; // Em Kwanzas (Kz)

  // Liquidação e Pagamento
  status: InvoiceStatus;
  paymentMethod?: 'Multicaixa Express (MCX)' | 'Referência Multicaixa' | 'Transferência Bancária (AO06)' | 'TPA Presencial' | 'Numerário';
  paymentReference?: {
    entity: string;
    reference: string;
  };
  paidAt?: string;

  // Auditoria e Certificação AGT
  electronic: ElectronicInvoiceMetadata;
  agtHash: string; // 4 caracteres de validação da assinatura
  agtCertificateNumber: string; // Ex: '1482/AGT'
  notes?: string;
  referencedInvoiceNumber?: string; // Utilizado em NCE (anulação/retificação)
}
