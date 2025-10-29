import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCandidates, updateCandidateStage } from '../store/slices/candidatesSlice';
import { fetchJobs } from '../store/slices/jobsSlice';
import MentionInput from '../components/legacy-ui/MentionInput';
import MentionDisplay from '../components/legacy-ui/MentionDisplay';
import type { Candidate } from '../types';
import './CandidateDetailPage.css';
import { candidatesApi } from '../services/api';

const CandidateDetailPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const dispatch = useAppDispatch();
  const { candidates, loading, error } = useAppSelector((state) => state.candidates);
  const { jobs } = useAppSelector((state) => state.jobs);
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [timeline, setTimeline] = useState<Array<{ type: string; at: string; stage?: string }>>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  
  // Mock team members for mentions
  const teamMembers = [
    'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 
    'Alex Rodriguez', 'Lisa Wang', 'David Brown', 'Maria Garcia'
  ];

  // No sample notes - start with empty notes
  // Load per-candidate notes from localStorage when candidate changes
  useEffect(() => {
    if (!candidateId) {
      setNotes([]);
      return;
    }
    try {
      const stored = localStorage.getItem(`notes:${candidateId}`);
      const parsed = stored ? JSON.parse(stored) as Array<{ id: string; text: string; createdAt: string }> : [];
      setNotes(Array.isArray(parsed) ? parsed : []);
    } catch {
      setNotes([]);
    }
  }, [candidateId]);

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

  useEffect(() => {
    if (jobs.length === 0) {
      dispatch(fetchJobs({}));
    }
  }, [dispatch, jobs.length]);

  // Fetch persisted timeline events from the API (MSW) when candidateId changes
  useEffect(() => {
    const load = async () => {
      if (!candidateId) return;
      try {
        setTimelineLoading(true);
        const res = await candidatesApi.getTimeline(candidateId);
        setTimeline(Array.isArray(res.data) ? res.data : []);
      } catch {
        // keep silent; timeline optional
      } finally {
        setTimelineLoading(false);
      }
    };
    load();
  }, [candidateId]);

  const candidate = candidates.find(c => c.id === candidateId);
  const job = jobs.find(j => j.id === candidate?.jobId);

  const handleStageChange = async (newStage: Candidate['stage']) => {
    if (candidate) {
      try {
        await dispatch(updateCandidateStage({ 
          id: candidate.id, 
          stage: newStage 
        }));
      } catch (error) {
        console.error('Failed to update candidate stage:', error);
      }
    }
  };

  const handleAddNote = () => {
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (noteText.trim() && candidate) {
      const newNote = {
        id: crypto.randomUUID(),
        text: noteText,
        createdAt: new Date().toISOString()
      };
      setNotes(prev => {
        const updated = [newNote, ...prev];
        try {
          localStorage.setItem(`notes:${candidate.id}`, JSON.stringify(updated.slice(0, 500)));
        } catch {
          /* noop */
        }
        return updated;
      });
      setNoteText('');
      setShowNoteModal(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => {
      const updated = prev.filter(note => note.id !== noteId);
      if (candidate) {
        try {
          localStorage.setItem(`notes:${candidate.id}`, JSON.stringify(updated));
        } catch {
          /* noop */
        }
      }
      return updated;
    });
  };

  if (loading) return <div className="loading">Loading candidate details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!candidate) return <div className="not-found">Candidate not found</div>;

  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  return (
    <div className="candidate-detail-page">
      <div className="candidate-detail-header">
        <div className="breadcrumb">
          <Link to="/candidates" className="breadcrumb-link">Candidates</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{candidate.name}</span>
        </div>
        
        <div className="candidate-detail-actions">
          <button onClick={handleAddNote} className="action-btn primary">
            Add Note
          </button>
        </div>
      </div>

      <div className="candidate-detail-content">
        <div className="candidate-detail-main">
          <div className="candidate-detail-card">
            <div className="candidate-detail-card-header">
              <h1 className="candidate-name">{candidate.name}</h1>
              <span className={`candidate-stage ${candidate.stage}`}>
                {candidate.stage}
              </span>
            </div>
            
            <div className="candidate-detail-info">
              <div className="candidate-info-item">
                <label>Email:</label>
                <span>{candidate.email}</span>
              </div>
              <div className="candidate-info-item">
                <label>Applied for:</label>
                <span>
                  {job ? (
                    <Link to={`/jobs/${job.id}`} className="job-link">
                      {job.title}
                    </Link>
                  ) : (
                    'Unknown Job'
                  )}
                </span>
              </div>
              <div className="candidate-info-item">
                <label>Applied:</label>
                <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="candidate-info-item">
                <label>Last Updated:</label>
                <span>{new Date(candidate.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="stage-management">
              <label>Current Stage:</label>
              <div className="stage-buttons">
                {stages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    className={`stage-btn ${candidate.stage === stage ? 'active' : ''}`}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="candidate-timeline-section">
            <h2>Timeline</h2>
            {timelineLoading ? (
              <div className="loading">Loading timeline…</div>
            ) : (
              <div className="timeline">
                {/* Always include the initial applied event as anchor */}
                <div className="timeline-item">
                  <div className="timeline-marker applied"></div>
                  <div className="timeline-content">
                    <h4>Applied</h4>
                    <p>Candidate applied for the position</p>
                    <span className="timeline-date">
                      {new Date(candidate.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Render persisted stage change events if any */}
                {timeline.map((evt, idx) => (
                  <div key={`${evt.at}-${idx}`} className="timeline-item">
                    <div className={`timeline-marker ${evt.stage || ''}`}></div>
                    <div className="timeline-content">
                      <h4>
                        {evt.type === 'stage_change' && evt.stage
                          ? `Moved to ${evt.stage}`
                          : 'Update'}
                      </h4>
                      <p>
                        {evt.type === 'stage_change' && evt.stage
                          ? `Candidate progressed to ${evt.stage} stage`
                          : 'Timeline event'}
                      </p>
                      <span className="timeline-date">
                        {new Date(evt.at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="candidate-notes-section">
            <h2>Notes ({notes.length})</h2>
            <div className="notes-list">
              {notes.length === 0 ? (
                <div className="empty-state">
                  <p>No notes added yet. Click "Add Note" to get started.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-content">
                      <MentionDisplay
                        text={note.text}
                        candidates={candidates}
                        jobs={jobs}
                        teamMembers={teamMembers}
                      />
                      <span className="note-date">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="delete-note-btn"
                      title="Delete note"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showNoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Note for {candidate.name}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteText('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <MentionInput
                value={noteText}
                onChange={setNoteText}
                placeholder="Enter your note here... Type @ to mention candidates, jobs, or team members"
                rows={6}
                candidates={candidates}
                jobs={jobs}
                teamMembers={teamMembers}
                onSubmit={handleSaveNote}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="action-btn"
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
              >
                Save Note
              </button>
              <button 
                className="action-btn"
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteText('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetailPage;
