import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssessments, fetchAllAssessments, createAssessment, deleteAssessment } from '../store/slices/assessmentsSlice';
import { fetchJobs } from '../store/slices/jobsSlice';
import AssessmentBuilder from '../components/Assessments/AssessmentBuilder';
import LivePreview from '../components/Assessments/LivePreview';
import type { Assessment, AssessmentSection, AssessmentQuestion } from '../types';
import './AssessmentsPage.css';

const AssessmentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assessments, loading, error } = useAppSelector((state) => state.assessments);
  const { jobs } = useAppSelector((state) => state.jobs);
  
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [previewAssessment, setPreviewAssessment] = useState<Assessment | null>(null);
  const [showAllAssessments, setShowAllAssessments] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (showAllAssessments) {
      dispatch(fetchAllAssessments());
    } else if (selectedJobId) {
      dispatch(fetchAssessments(selectedJobId));
    }
  }, [dispatch, selectedJobId, showAllAssessments]);

  const handleCreateAssessment = async () => {
    if (!selectedJobId) {
      alert('Please select a job first');
      return;
    }
    
    const newAssessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'> = {
      jobId: selectedJobId,
      title: 'New Assessment',
      sections: [
        {
          id: crypto.randomUUID(),
          title: 'Section 1',
          questions: []
        }
      ]
    };
    
    try {
      const result = await dispatch(createAssessment(newAssessment));
      if (result.payload) {
        setEditingAssessment(result.payload);
        setShowBuilder(true);
      }
    } catch (error) {
      console.error('Failed to create assessment:', error);
      alert('Failed to create assessment');
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setShowBuilder(true);
  };

  const handlePreviewAssessment = (assessment: Assessment) => {
    setPreviewAssessment(assessment);
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    if (window.confirm(`Are you sure you want to delete "${assessment.title}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteAssessment(assessment.id));
        alert('Assessment deleted successfully!');
      } catch (error) {
        alert('Failed to delete assessment');
        console.error('Delete error:', error);
      }
    }
  };

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  return (
    <div className="assessments-page">
      <div className="assessments-header">
        <h1>Assessments</h1>
        <p>Create and manage assessments for your job positions</p>
      </div>

      <div className="assessments-controls">
        <div className="job-selector">
          <label htmlFor="job-select">Select Job:</label>
          <select
            id="job-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="job-select"
          >
            <option value="">Choose a job...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div className="assessment-actions">
          {selectedJobId && (
            <button
              onClick={handleCreateAssessment}
              className="create-assessment-btn"
            >
              + Create Assessment
            </button>
          )}
          
          <button
            onClick={() => setShowAllAssessments(!showAllAssessments)}
            className="view-all-btn"
          >
            {showAllAssessments ? 'Hide All' : 'View All'} Assessments
          </button>
        </div>
      </div>

      {(selectedJobId || showAllAssessments) && (
        <div className="assessments-content">
          {loading && <div className="loading">Loading assessments...</div>}
          {error && <div className="error">Error: {error}</div>}
          
          {!loading && !error && (
            <>
              <div className="assessments-list">
                <h3>
                  {showAllAssessments 
                    ? 'All Assessments' 
                    : `Assessments for ${selectedJob?.title}`
                  }
                </h3>
                {assessments.length === 0 ? (
                  <div className="empty-state">
                    <p>
                      {showAllAssessments 
                        ? 'No assessments found in the system' 
                        : 'No assessments created yet'
                      }
                    </p>
                    {!showAllAssessments && <p>Click "Create Assessment" to get started</p>}
                  </div>
                ) : (
                  <div className="assessment-cards">
                    {assessments.map((assessment) => (
                      <div key={assessment.id} className="assessment-card">
                        <div className="assessment-header">
                          <h4>{assessment.title}</h4>
                          {showAllAssessments && (
                            <div className="assessment-job">
                              Job: {jobs.find(job => job.id === assessment.jobId)?.title || 'Unknown Job'}
                            </div>
                          )}
                          <span className="assessment-date">
                            Created: {new Date(assessment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="assessment-stats">
                          <span>{assessment.sections.length} sections</span>
                          <span>
                            {assessment.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                          </span>
                        </div>
                        <div className="assessment-actions">
                          <button
                            onClick={() => handleEditAssessment(assessment)}
                            className="edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePreviewAssessment(assessment)}
                            className="preview-btn"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDeleteAssessment(assessment)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {showBuilder && editingAssessment && (
        <AssessmentBuilder
          assessment={editingAssessment}
          onClose={() => {
            setShowBuilder(false);
            setEditingAssessment(null);
          }}
        />
      )}

      {previewAssessment && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <div className="preview-modal-header">
              <h2>Assessment Preview: {previewAssessment.title}</h2>
              <button
                onClick={() => setPreviewAssessment(null)}
                className="preview-close-btn"
              >
                ×
              </button>
            </div>
            <div className="preview-modal-content">
              <LivePreview assessment={previewAssessment} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentsPage;
