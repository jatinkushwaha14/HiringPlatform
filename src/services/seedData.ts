import { db } from './database';
import type { Job, Candidate } from '../types/index.ts';

export const seedDatabase = async () => {
  // Check if data already exists
  const existingJobs = await db.jobs.count();
  if (existingJobs > 0) return;

  // Create some sample jobs
  const sampleJobs: Job[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      slug: 'frontend-developer',
      status: 'active',
      tags: ['React', 'TypeScript', 'Frontend'],
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Backend Developer',
      slug: 'backend-developer',
      status: 'active',
      tags: ['Node.js', 'Python', 'Backend'],
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      slug: 'full-stack-developer',
      status: 'archived',
      tags: ['React', 'Node.js', 'Full Stack'],
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Add jobs to database
  await db.jobs.bulkAdd(sampleJobs);

  // Create some sample candidates
  const sampleCandidates: Candidate[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      stage: 'applied',
      jobId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      stage: 'screen',
      jobId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  await db.candidates.bulkAdd(sampleCandidates);
};

// Call this function when the app starts
seedDatabase();