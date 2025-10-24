import React from 'react';
import type { Job, Candidate } from '../types';


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