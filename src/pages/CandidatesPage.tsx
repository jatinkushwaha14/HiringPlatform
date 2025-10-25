import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCandidates } from '../store/slices/candidatesSlice';
import { forceSeedDatabase } from '../services/seedData';
import type { Candidate } from '../types';
import './CandidatesPage.css';

const CandidatesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { candidates, loading, error } = useAppSelector((state) => state.candidates);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    dispatch(fetchCandidates({}));
  }, [dispatch]);

  const handleSeedData = async () => {
    console.log('Starting force seed...');
    const success = await forceSeedDatabase();
    if (success) {
      console.log('Force seed completed, refreshing candidates...');
      dispatch(fetchCandidates({}));
    } else {
      console.error('Force seed failed');
    }
  };

  const handleViewProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowProfile(true);
  };

  const handleAddNote = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (noteText.trim() && selectedCandidate) {
      // In a real app, this would save to database
      console.log(`Note for ${selectedCandidate.name}: ${noteText}`);
      setNoteText('');
      setShowNoteModal(false);
      setSelectedCandidate(null);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || candidate.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const candidatesByStage = {
    applied: filteredCandidates.filter(c => c.stage === 'applied'),
    screen: filteredCandidates.filter(c => c.stage === 'screen'),
    tech: filteredCandidates.filter(c => c.stage === 'tech'),
    offer: filteredCandidates.filter(c => c.stage === 'offer'),
    hired: filteredCandidates.filter(c => c.stage === 'hired'),
    rejected: filteredCandidates.filter(c => c.stage === 'rejected'),
  };

  if (loading) return <div className="loading">Loading candidates...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="candidates-page">
      <div className="candidates-header">
        <h1 className="candidates-title">Candidates</h1>
        <p className="candidates-subtitle">
          Manage candidate applications and track their progress
        </p>
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={handleSeedData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '8px'
            }}
          >
            Generate Sample Data (1000 candidates)
          </button>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Current: {candidates.length} candidates
          </span>
        </div>
      </div>
      
      <div className="candidates-controls">
        <div className="candidates-filters">
          <input
            type="text"
            placeholder="Search candidates by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="candidates-search"
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="candidates-filter"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="tech">Tech</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="view-toggle">
          <button
            onClick={() => setView('list')}
            className={`view-btn ${view === 'list' ? 'active' : ''}`}
          >
            List View
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`view-btn ${view === 'kanban' ? 'active' : ''}`}
          >
            Kanban View
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="candidates-list">
          {filteredCandidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3 className="empty-title">No candidates found</h3>
              <p className="empty-message">
                {search || stageFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No candidates have applied yet'
                }
              </p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="candidate-card">
                <div className="candidate-info">
                  <h3 className="candidate-name">{candidate.name}</h3>
                  <p className="candidate-email">{candidate.email}</p>
                  <span className={`candidate-stage ${candidate.stage}`}>
                    {candidate.stage}
                  </span>
                </div>
                <div className="candidate-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleViewProfile(candidate)}
                  >
                    View Profile
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleAddNote(candidate)}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="kanban-board">
          {Object.entries(candidatesByStage).map(([stage, stageCandidates]) => (
            <div key={stage} className="kanban-column">
              <div className="kanban-header">
                <h3 className="kanban-title">{stage.charAt(0).toUpperCase() + stage.slice(1)}</h3>
                <span className="kanban-count">{stageCandidates.length}</span>
              </div>
              <div className="kanban-cards">
                {stageCandidates.map((candidate) => (
                  <div key={candidate.id} className="kanban-card">
                    <h4 className="kanban-card-name">{candidate.name}</h4>
                    <p className="kanban-card-email">{candidate.email}</p>
                    <div className="kanban-card-actions">
                      <button 
                        className="kanban-btn"
                        onClick={() => handleViewProfile(candidate)}
                      >
                        View
                      </button>
                      <button 
                        className="kanban-btn"
                        onClick={() => handleAddNote(candidate)}
                      >
                        Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Profile Modal */}
      {showProfile && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Candidate Profile</h2>
              <button 
                className="modal-close"
                onClick={() => setShowProfile(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-info">
                <h3>{selectedCandidate.name}</h3>
                <p><strong>Email:</strong> {selectedCandidate.email}</p>
                <p><strong>Stage:</strong> 
                  <span className={`candidate-stage ${selectedCandidate.stage}`}>
                    {selectedCandidate.stage}
                  </span>
                </p>
                <p><strong>Applied:</strong> {new Date(selectedCandidate.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(selectedCandidate.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="profile-actions">
                <button 
                  className="action-btn"
                  onClick={() => {
                    setShowProfile(false);
                    handleAddNote(selectedCandidate);
                  }}
                >
                  Add Note
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Note for {selectedCandidate.name}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedCandidate(null);
                  setNoteText('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note here..."
                className="note-textarea"
                rows={6}
              />
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
                    setSelectedCandidate(null);
                    setNoteText('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;