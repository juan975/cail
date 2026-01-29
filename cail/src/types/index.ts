export type UserRole = 'candidate' | 'employer';

export interface CandidateUserData {
  id: string;
  name: string;
  email: string;
  progress?: number;
}

export interface EmployerUserData {
  id: string;
  company: string;
  contactName: string;
  email: string;
  needsPasswordChange?: boolean;
  isEmailVerified?: boolean;
}

export type UserData = CandidateUserData | EmployerUserData;

export interface UserSession {
  role: UserRole;
  userData: UserData;
  needsPasswordChange?: boolean;
  isEmailVerified?: boolean;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  modality: 'Presencial' | 'Remoto' | 'Híbrido' | 'Hibrido';
  salaryRange: string;
  employmentType: 'Tiempo completo' | 'Medio tiempo' | 'Contrato' | 'Freelance' | 'Tiempo Completo';
  industry: string;
  requiredCompetencies: string[];
  requiredExperience: string;
  requiredEducation: string;
  professionalArea: string;
  economicSector: string;
  experienceLevel: string;
  postedDate: string;
  matchScore?: number;
  technicalSkills?: string[];
}

export type ApplicationStatus = 'Postulado' | 'En revisión' | 'Entrevista' | 'Oferta' | 'Finalizado';

export interface CandidateApplication {
  id: string;
  title: string;
  company: string;
  status: ApplicationStatus;
  stage: string;
  submittedAt: string;
  priority: 'Alta' | 'Media' | 'Baja';
  score: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'Proceso' | 'Sugerencia' | 'Alerta';
  unread?: boolean;
}

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface EmployerOffer extends JobOffer {
  applicants: number;
  views: number;
  active: boolean;
  deadline: string;
  tags: string[];
}

export interface EmployerApplication {
  id: string;
  candidateName: string;
  position: string;
  experienceYears: number;
  matchScore: number;
  status: 'Nuevo' | 'En entrevista' | 'Descartado' | 'Contratado';
  submittedAt: string;
  channel: 'Web' | 'Recomendado' | 'Referencia';
  notes?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

export interface CandidateProfileForm {
  fullName: string;
  email: string;
  cedula: string;
  phone: string;
  city: string;
  sectorIndustrial: string;
  address: string;
  professionalSummary: string;
  educationLevel: string;
  degree: string;
  yearsExperience: string;
  experienceSummary: string;
  technicalSkills: string[];
  softSkills: string[];
  competencies: string[];
  workExperience: WorkExperience[];
}

export interface EmployerProfileForm {
  companyName: string;
  commercialName: string;
  razonSocial: string;
  ruc: string;
  industry: string;
  companyType: string;
  numberOfEmployees: string;
  description: string;
  website: string;
  address: string;
  city: string;
  contactName: string;
  cargo: string;
  email: string;
  phone: string;
}
