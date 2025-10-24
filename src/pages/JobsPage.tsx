import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchJobs } from '../store/slices/jobsSlice';

const JobsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  React.useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Jobs Board</h1>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Jobs List */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {filteredJobs.map((job) => (
          <div key={job.id} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: job.status === 'archived' ? '#f5f5f5' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{job.title}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#666' }}>#{job.slug}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {job.tags.map((tag, index) => (
                    <span key={index} style={{ 
                      backgroundColor: '#e3f2fd', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  backgroundColor: job.status === 'active' ? '#4caf50' : '#ff9800',
                  color: 'white'
                }}>
                  {job.status}
                </span>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                  Order: {job.order}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsPage;