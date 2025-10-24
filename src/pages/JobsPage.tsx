import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchJobs, createJob, updateJob } from '../store/slices/jobsSlice';
import JobForm from '../components/Jobs/JobForm';
import type { Job } from '../types/index.ts';
import './JobsPage.css';

const JobsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();


  React.useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = () => {
    setEditingJob(undefined);
    setShowForm(true);
  };
  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleSubmitJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingJob) {
      await dispatch(updateJob({ id: editingJob.id, updates: jobData }));
    } else {
      await dispatch(createJob(jobData));
    }
    setShowForm(false);
    setEditingJob(undefined);
  };

  const handleArchiveJob = async (job: Job) => {
    await dispatch(updateJob({ 
      id: job.id, 
      updates: { status: job.status === 'active' ? 'archived' : 'active' } 
    }));
  };
  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1 className="jobs-title">Jobs Board</h1>
        <p className="jobs-subtitle">
          Manage your job postings and track applications
        </p>
      </div>
      
      <div className="jobs-controls">
        <div className="jobs-filters">
          <input
            type="text"
            placeholder="Search jobs by title or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="jobs-search"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="jobs-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button
          onClick={handleCreateJob}
          className="create-job-btn"
        >
          + Create Job
        </button>
      </div>

      <div className="jobs-list">
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No jobs found</h3>
            <p className="empty-message">
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first job posting to get started'
              }
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className={`job-card ${job.status === 'archived' ? 'archived' : ''}`}>
              <div className="job-content">
                <div className="job-info">
                  <div className="job-header">
                    <h3 className="job-title">{job.title}</h3>
                    <span className={`job-status ${job.status}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <p className="job-slug">
                    #{job.slug}
                  </p>
                  
                  <div className="job-tags">
                    {job.tags.map((tag, index) => (
                      <span key={index} className="job-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="job-actions">
                  <div className="job-buttons">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditJob(job);
                      }}
                      className="job-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveJob(job);
                      }}
                      className={`job-btn ${job.status === 'active' ? 'archive' : 'unarchive'}`}
                    >
                      {job.status === 'active' ? 'Archive' : 'Unarchive'}
                    </button>
                  </div>
                  
                  <div className="job-order">
                    Order: {job.order}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <JobForm
          job={editingJob}
          onSubmit={handleSubmitJob}
          onCancel={() => {
            setShowForm(false);
            setEditingJob(undefined);
          }}
        />
      )}
    </div>
  );
};

export default JobsPage;