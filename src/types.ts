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
