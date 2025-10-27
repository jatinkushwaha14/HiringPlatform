import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssessments, fetchAllAssessments, createAssessment, deleteAssessment } from '../store/slices/assessmentsSlice';
import { fetchJobs } from '../store/slices/jobsSlice';
import { fetchCandidates } from '../store/slices/candidatesSlice';
import { fetchAssessmentResponses } from '../store/slices/assessmentResponsesSlice';
import AssessmentBuilder from '../components/Assessments/AssessmentBuilder';
import AssessmentTaker from '../components/Assessments/AssessmentTaker';
import AssessmentResults from '../components/Assessments/AssessmentResults';
import LivePreview from '../components/Assessments/LivePreview';
import type { Assessment, AssessmentResponse } from '../types';
import './AssessmentsPage.css';

const AssessmentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assessments, loading, error } = useAppSelector((state) => state.assessments);
  const { jobs } = useAppSelector((state) => state.jobs);
  const { candidates } = useAppSelector((state) => state.candidates);
  const { responses: assessmentResponses, loading: responsesLoading } = useAppSelector((state) => state.assessmentResponses);
  
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [previewAssessment, setPreviewAssessment] = useState<Assessment | null>(null);
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [showTaker, setShowTaker] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<AssessmentResponse | null>(null);
  const [viewMode, setViewMode] = useState<'manage' | 'responses'>('manage');

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchCandidates({}));
  }, [dispatch]);

  useEffect(() => {
    if (showAllAssessments) {
      dispatch(fetchAllAssessments());
    } else if (selectedJobId) {
      dispatch(fetchAssessments(selectedJobId));
    }
  }, [dispatch, selectedJobId, showAllAssessments]);

  // Load all assessments when switching to responses view
  useEffect(() => {
    if (viewMode === 'responses' && assessments.length === 0) {
      dispatch(fetchAllAssessments());
    }
  }, [dispatch, viewMode, assessments.length]);

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
      if (result.payload && typeof result.payload === 'object' && 'id' in result.payload) {
        setEditingAssessment(result.payload as Assessment);
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

  const handleTakeAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowTaker(true);
  };

  const handleViewResponses = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setViewMode('responses');
    await dispatch(fetchAssessmentResponses(assessment.id));
  };

  const handleViewResponse = (response: AssessmentResponse) => {
    setSelectedResponse(response);
    setShowResults(true);
  };

  const handleAssessmentComplete = (_responseId: string) => {
    setShowTaker(false);
    setSelectedAssessment(null);
    setSelectedCandidate('');
    alert('Assessment submitted successfully!');
    // Refresh responses if we're viewing them
    if (selectedAssessment) {
      dispatch(fetchAssessmentResponses(selectedAssessment.id));
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
        <div className="view-mode-toggle">
          <button
            onClick={() => setViewMode('manage')}
            className={`mode-btn ${viewMode === 'manage' ? 'active' : ''}`}
          >
            Manage Assessments
          </button>
          <button
            onClick={() => setViewMode('responses')}
            className={`mode-btn ${viewMode === 'responses' ? 'active' : ''}`}
          >
            View Responses
          </button>
        </div>

        {viewMode === 'manage' && (
          <>
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
          </>
        )}

        {viewMode === 'responses' && (
          <div className="response-controls">
            <div className="assessment-selector">
              <label htmlFor="assessment-select">Select Assessment:</label>
              <select
                id="assessment-select"
                value={selectedAssessment?.id || ''}
                onChange={(e) => {
                  const assessment = assessments.find(a => a.id === e.target.value);
                  if (assessment) {
                    handleViewResponses(assessment);
                  }
                }}
                className="assessment-select"
              >
                <option value="">Choose an assessment...</option>
                {assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.title} ({jobs.find(job => job.id === assessment.jobId)?.title})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="assessments-content">
        {viewMode === 'manage' && (selectedJobId || showAllAssessments) && (
          <>
            {loading && <div className="loading">Loading assessments...</div>}
            {error && <div className="error">Error: {error}</div>}
            
            {!loading && !error && (
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
                            onClick={() => handleTakeAssessment(assessment)}
                            className="take-btn"
                          >
                            Take Assessment
                          </button>
                          <button
                            onClick={() => handleViewResponses(assessment)}
                            className="responses-btn"
                          >
                            View Responses
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
            )}
          </>
        )}

        {viewMode === 'responses' && selectedAssessment && (
          <>
            {responsesLoading && <div className="loading">Loading responses...</div>}
            
            <div className="responses-list">
              <h3>Responses for: {selectedAssessment.title}</h3>
              {assessmentResponses.length === 0 ? (
                <div className="empty-state">
                  <p>No responses found for this assessment</p>
                  <p>Candidates can take the assessment to see responses here</p>
                </div>
              ) : (
                <div className="response-cards">
                  {assessmentResponses.map((response) => {
                    const candidate = candidates.find(c => c.id === response.candidateId);
                    return (
                      <div key={response.id} className="response-card">
                        <div className="response-header">
                          <h4>{candidate?.name || 'Unknown Candidate'}</h4>
                          <span className="response-date">
                            Submitted: {new Date(response.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="response-info">
                          <span className="candidate-email">{candidate?.email || 'No email'}</span>
                          <span className="response-count">
                            {Object.keys(response.responses).length} questions answered
                          </span>
                        </div>
                        <div className="response-actions">
                          <button
                            onClick={() => handleViewResponse(response)}
                            className="view-response-btn"
                          >
                            View Response
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

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

      {showTaker && selectedAssessment && (
        <div className="taker-modal-overlay">
          <div className="taker-modal">
            <div className="taker-modal-header">
              <h2>Take Assessment: {selectedAssessment.title}</h2>
              <button
                onClick={() => {
                  setShowTaker(false);
                  setSelectedAssessment(null);
                }}
                className="taker-close-btn"
              >
                ×
              </button>
            </div>
            <div className="taker-modal-content">
              <div className="candidate-selector-section">
                <label htmlFor="candidate-select">Select Candidate:</label>
                <select
                  id="candidate-select"
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="candidate-select"
                >
                  <option value="">Choose a candidate...</option>
                  {candidates.slice(0, 10).map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} ({candidate.email})
                    </option>
                  ))}
                </select>
              </div>
              {selectedCandidate && (
                <AssessmentTaker
                  key={`${selectedAssessment.id}-${selectedCandidate}`}
                  assessment={selectedAssessment}
                  candidateId={selectedCandidate}
                  onComplete={handleAssessmentComplete}
                  onCancel={() => {
                    setShowTaker(false);
                    setSelectedAssessment(null);
                    setSelectedCandidate('');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showResults && selectedResponse && selectedAssessment && (
        <div className="results-modal-overlay">
          <div className="results-modal">
            <div className="results-modal-header">
              <h2>Assessment Results</h2>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedResponse(null);
                }}
                className="results-close-btn"
              >
                ×
              </button>
            </div>
            <div className="results-modal-content">
              <AssessmentResults
                assessment={selectedAssessment}
                response={selectedResponse}
                candidateName={candidates.find(c => c.id === selectedResponse.candidateId)?.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentsPage;
