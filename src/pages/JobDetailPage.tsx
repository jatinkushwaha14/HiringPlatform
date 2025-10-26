import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchJobs, updateJob } from '../store/slices/jobsSlice';
import { fetchCandidates } from '../store/slices/candidatesSlice';
import JobForm from '../components/Jobs/JobForm';
import type { Job } from '../types';
import './JobDetailPage.css';

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const { candidates } = useAppSelector((state) => state.candidates);
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  useEffect(() => {
    if (jobs.length === 0) {
      dispatch(fetchJobs());
    }
  }, [dispatch, jobs.length]);

  useEffect(() => {
    // Keep trying to fetch candidates until we get some
    const fetchCandidatesWithRetry = async () => {
      const result = await dispatch(fetchCandidates({}));
      if (result.payload && Array.isArray(result.payload) && result.payload.length === 0) {
        // If no candidates, wait a bit and try again
        setTimeout(() => {
          dispatch(fetchCandidates({}));
        }, 1000);
      }
    };
    
    fetchCandidatesWithRetry();
  }, [dispatch]);

  const job = jobs.find(j => j.id === jobId);
  const jobCandidates = candidates.filter(c => c.jobId === jobId);
  
  const candidatesByStage = {
    applied: jobCandidates.filter(c => c.stage === 'applied'),
    screen: jobCandidates.filter(c => c.stage === 'screen'),
    tech: jobCandidates.filter(c => c.stage === 'tech'),
    offer: jobCandidates.filter(c => c.stage === 'offer'),
    hired: jobCandidates.filter(c => c.stage === 'hired'),
    rejected: jobCandidates.filter(c => c.stage === 'rejected'),
  };

  const handleEditJob = () => {
    setShowEditForm(true);
  };

  const handleSubmitJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (job) {
      await dispatch(updateJob({ id: job.id, updates: jobData }));
      setShowEditForm(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (job) {
      await dispatch(updateJob({ 
        id: job.id, 
        updates: { status: job.status === 'active' ? 'archived' : 'active' } 
      }));
      setShowArchiveConfirm(false);
    }
  };

  const handleDeleteJob = async () => {
    if (job && window.confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
      // In a real app, you'd dispatch a delete action
      console.log('Delete job:', job.id);
      navigate('/jobs');
    }
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!job) return <div className="not-found">Job not found</div>;

  return (
    <div className="job-detail-page">
      <div className="job-detail-header">
        <div className="breadcrumb">
          <Link to="/jobs" className="breadcrumb-link">Jobs</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{job.title}</span>
        </div>
        
        <div className="job-detail-actions">
          <button onClick={handleEditJob} className="action-btn primary">
            Edit Job
          </button>
          <button 
            onClick={() => setShowArchiveConfirm(true)} 
            className={`action-btn ${job.status === 'active' ? 'warning' : 'success'}`}
          >
            {job.status === 'active' ? 'Archive' : 'Unarchive'}
          </button>
          <button onClick={handleDeleteJob} className="action-btn danger">
            Delete
          </button>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-detail-main">
          <div className="job-detail-card">
            <div className="job-detail-card-header">
              <h1 className="job-title">{job.title}</h1>
              <span className={`job-status ${job.status}`}>
                {job.status}
              </span>
            </div>
            
            <div className="job-detail-info">
              <div className="job-info-item">
                <label>URL Slug:</label>
                <span>#{job.slug}</span>
              </div>
              <div className="job-info-item">
                <label>Display Order:</label>
                <span>{job.order}</span>
              </div>
              <div className="job-info-item">
                <label>Created:</label>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="job-info-item">
                <label>Last Updated:</label>
                <span>{new Date(job.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="job-tags-section">
              <label>Tags:</label>
              <div className="job-tags">
                {job.tags.map((tag, index) => (
                  <span key={index} className="job-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="job-candidates-section">
            <h2>Candidates ({jobCandidates.length})</h2>
            <div className="candidates-summary">
              {Object.entries(candidatesByStage).map(([stage, stageCandidates]) => (
                <div key={stage} className="stage-summary">
                  <span className="stage-name">{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
                  <span className="stage-count">{stageCandidates.length}</span>
                </div>
              ))}
            </div>
            
            <div className="candidates-list">
              {jobCandidates.length === 0 ? (
                <div className="empty-state">
                  <p>No candidates have applied for this job yet.</p>
                </div>
              ) : (
                <div className="job-candidates-list">
                  <div className="list-header">
                    <span className="candidate-count">
                      {jobCandidates.length} candidate{jobCandidates.length !== 1 ? 's' : ''} applied
                    </span>
                    <span className="performance-note">
                      📋 Regular list (virtualization available for large lists)
                    </span>
                  </div>
                  <div className="job-candidates-container">
                    {jobCandidates.map((candidate) => (
                      <div key={candidate.id} className="candidate-item">
                        <div className="candidate-info">
                          <Link 
                            to={`/candidates/${candidate.id}`}
                            className="candidate-name"
                          >
                            {candidate.name}
                          </Link>
                          <span className="candidate-email">{candidate.email}</span>
                        </div>
                        <span className={`candidate-stage ${candidate.stage}`}>
                          {candidate.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditForm && (
        <JobForm
          job={job}
          onSubmit={handleSubmitJob}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {showArchiveConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{job.status === 'active' ? 'Archive Job' : 'Unarchive Job'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowArchiveConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {job.status === 'active' ? 'archive' : 'unarchive'} 
                "{job.title}"?
              </p>
              {job.status === 'active' && (
                <p className="warning-text">
                  Archived jobs will not accept new applications.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="action-btn"
                onClick={() => setShowArchiveConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className={`action-btn ${job.status === 'active' ? 'warning' : 'success'}`}
                onClick={handleArchiveToggle}
              >
                {job.status === 'active' ? 'Archive' : 'Unarchive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
