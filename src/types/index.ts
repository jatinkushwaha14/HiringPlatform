export interface Job {
    id: string;
    title: string;
    slug: string;
    status: 'active' | 'archived';
    tags: string[];
    order: number;
    createdAt: string;
    updatedAt: string;
  }
  
export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  sections: AssessmentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  question: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  conditionalLogic?: {
    dependsOn: string;
    condition: string;
    value: string;
  };
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  submittedAt: string;
}