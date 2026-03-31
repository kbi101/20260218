export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  title?: string;
  address?: string;
  job?: string;
  isPrimary?: boolean;
}

export interface Organization {
  id: number;
  name: string;
  industry?: string;
  website?: string;
}

export interface JobProfile {
  id: number;
  title: string;
  description?: string;
  targetIndustry?: string;
  expectedSalary?: string;
  workModel?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  jobType?: 'FULL_TIME' | 'CONTRACT' | 'PART_TIME';
  person?: Person;
}

export interface JobOpportunity {
  id: number;
  jobProfile: JobProfile;
  organization: Organization;
  jobTitle?: string;
  status: 'TARGET' | 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'ABORTED';
  jobPostingUrl?: string;
  applicationLoginUrl?: string;
  applicationLoginInfo?: string;
  notes?: string;
  applicationDate?: string;
  preparationNote?: string;
  jobRequirements?: string;
  contacts: any[];
}

export interface Resume {
  id: number;
  name: string;
  content: string; // Markdown
  lastUpdated?: string;
  isPrimary?: boolean;
  person?: Person;
}

export interface ResumeSnippet {
  id?: number;
  type: 'EXPERIENCE' | 'SUMMARY' | 'EDUCATION' | 'CORE_COMPETENCY' | 'LEADERSHIP' | 'COMMUNICATION';
  name: string;
  company?: string;
  role?: string;
  duration: string;
  briefing: string;
  technicalStacks: string;
  roi: string;
}

export interface ElevatorPitch {
  id: number;
  name: string;
  targetRole: string;
  bullets: string;
  content: string;
  fontSize?: number;
}

export interface Relationship {
  id: number;
  sourcePerson?: Person;
  targetPerson?: Person;
  sourceOrganization?: Organization;
  targetOrganization?: Organization;
  type: string;
}

export interface GraphNodePosition {
  nodeId: string;
  x: number;
  y: number;
}
