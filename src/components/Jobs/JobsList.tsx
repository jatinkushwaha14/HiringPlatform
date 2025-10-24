import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../../store/slices/jobsSlice';
import type { AppDispatch, RootState } from '../../store';

const JobsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Jobs ({jobs.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {jobs.map((job) => (
          <div key={job.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <h3>{job.title}</h3>
            <p>Status: {job.status}</p>
            <p>Tags: {job.tags.join(', ')}</p>
            <p>Order: {job.order}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsList;