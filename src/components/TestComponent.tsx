import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchJobs } from '../store/slices/jobsSlice';

const TestComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Test Component</h1>
      <p>Jobs count: {jobs.length}</p>
      <pre>{JSON.stringify(jobs, null, 2)}</pre>
    </div>
  );
};

export default TestComponent;