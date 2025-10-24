import Dexie, { type Table } from 'dexie';
import type { Job, Candidate} from '../types/index.ts';

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
//   candidateTimeline!: Table<CandidateTimeline>;
//   assessments!: Table<Assessment>;
//   assessmentResponses!: Table<AssessmentResponse>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt, updatedAt',
      candidates: 'id, name, email, stage, jobId, createdAt, updatedAt',
    //   candidateTimeline: 'id, candidateId, stage, timestamp',
    //   assessments: 'id, jobId, title, createdAt, updatedAt',
    //   assessmentResponses: 'id, assessmentId, candidateId, submittedAt'
    });
  }
}

export const db = new TalentFlowDB();