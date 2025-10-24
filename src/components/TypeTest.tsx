import React from 'react';

interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  createdAt: string;
  updatedAt: string;
}

const TypeTest: React.FC = () => {
  const testJob: Job = {
    id: '1',
    title: 'Test Job',
    slug: 'test-job',
    status: 'active',
    tags: ['test'],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testCandidate: Candidate = {
    id: '1',
    name: 'Test Candidate',
    email: 'test@example.com',
    stage: 'applied',
    jobId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div>
      <h2>Type Test</h2>
      <p>Job: {testJob.title}</p>
      <p>Candidate: {testCandidate.name}</p>
    </div>
  );
};

export default TypeTest;