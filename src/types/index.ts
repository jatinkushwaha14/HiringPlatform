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