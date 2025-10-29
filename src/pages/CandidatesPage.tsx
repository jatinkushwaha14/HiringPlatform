import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCandidates, updateCandidateStage } from '../store/slices/candidatesSlice';
import MentionInput from '../components/legacy-ui/MentionInput';
import VirtualizedCandidateList from '../components/Candidates/VirtualizedCandidateList';
import Pagination from '../components/legacy-ui/Pagination';
import type { Candidate } from '../types';
import './CandidatesPage.css';

// Sortable Candidate Card Component
const SortableCandidateCard: React.FC<{ 
  candidate: Candidate; 
  onViewProfile: (candidate: Candidate) => void; 
  onAddNote: (candidate: Candidate) => void;
}> = ({ candidate, onViewProfile, onAddNote }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...attributes}
      {...listeners}
    >
      <Link to={`/candidates/${candidate.id}`} className="kanban-card-name">
        {candidate.name}
      </Link>
      <p className="kanban-card-email">{candidate.email}</p>
      <div className="kanban-card-actions">
        <button 
          className="kanban-btn"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(candidate);
          }}
        >
          View
        </button>
        <button 
          className="kanban-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAddNote(candidate);
          }}
        >
          Note
        </button>
      </div>
    </div>
  );
};

// Droppable Kanban Column Component
const DroppableKanbanColumn: React.FC<{ 
  stage: string; 
  candidates: Candidate[]; 
  onViewProfile: (candidate: Candidate) => void; 
  onAddNote: (candidate: Candidate) => void;
}> = ({ stage, candidates, onViewProfile, onAddNote }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'drop-target' : ''}`}
    >
      <div className="kanban-header">
        <h3 className="kanban-title">{stage.charAt(0).toUpperCase() + stage.slice(1)}</h3>
        <span className="kanban-count">{candidates.length}</span>
      </div>
      <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-cards">
          {candidates.map((candidate) => (
            <SortableCandidateCard
              key={candidate.id}
              candidate={candidate}
              onViewProfile={onViewProfile}
              onAddNote={onAddNote}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const CandidatesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { candidates, loading, error } = useAppSelector((state) => state.candidates);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const hasValidData = useRef(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Mock team members for mentions
  const teamMembers = [
    'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 
    'Alex Rodriguez', 'Lisa Wang', 'David Brown', 'Maria Garcia'
  ];
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    dispatch(fetchCandidates({ search, stage: stageFilter === 'all' ? undefined : stageFilter, page: currentPage, pageSize }));
  }, [dispatch, search, stageFilter, currentPage, pageSize]);

  // Monitor candidates state changes
  useEffect(() => {
    console.log('Candidates state updated:', candidates.length, 'candidates');
    hasValidData.current = candidates && Array.isArray(candidates) && candidates.length > 0;
  }, [candidates]);

  // Seeding removed; dataset expected to contain 1000 candidates

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);
      const candidate = candidates.find(c => c.id === activeIdStr);
      
      // Find the stage by looking at which column the drop happened in
      let newStage = '';
      if (overIdStr === 'applied' || candidatesByStage.applied.some(c => c.id === overIdStr)) {
        newStage = 'applied';
      } else if (overIdStr === 'screen' || candidatesByStage.screen.some(c => c.id === overIdStr)) {
        newStage = 'screen';
      } else if (overIdStr === 'tech' || candidatesByStage.tech.some(c => c.id === overIdStr)) {
        newStage = 'tech';
      } else if (overIdStr === 'offer' || candidatesByStage.offer.some(c => c.id === overIdStr)) {
        newStage = 'offer';
      } else if (overIdStr === 'hired' || candidatesByStage.hired.some(c => c.id === overIdStr)) {
        newStage = 'hired';
      } else if (overIdStr === 'rejected' || candidatesByStage.rejected.some(c => c.id === overIdStr)) {
        newStage = 'rejected';
      }

      if (candidate && newStage && newStage !== candidate.stage) {
        try {
          // Simulate 10% failure rate as per assignment requirements
          if (Math.random() < 0.1) {
            throw new Error('Simulated API failure');
          }
          
          await dispatch(updateCandidateStage({ 
            id: candidate.id, 
            stage: newStage as 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'
          }));
          
          console.log(`Moved ${candidate.name} from ${candidate.stage} to ${newStage} stage`);
        } catch (error) {
          console.error('Failed to update candidate stage:', error);
          // Rollback - refresh candidates to get original state
          dispatch(fetchCandidates({}));
        }
      }
    }
  };

  const total = useAppSelector(s => s.candidates.total) || 0;
  const paginatedCandidates = candidates; // items are current page from API
  const totalPages = Math.max(1, Math.ceil(Math.max(1, total) / Math.max(1, pageSize)));

  // Clamp current page when total changes (e.g., filter/search)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter]);

  const candidatesByStage = {
    applied: candidates.filter(c => c.stage === 'applied'),
    screen: candidates.filter(c => c.stage === 'screen'),
    tech: candidates.filter(c => c.stage === 'tech'),
    offer: candidates.filter(c => c.stage === 'offer'),
    hired: candidates.filter(c => c.stage === 'hired'),
    rejected: candidates.filter(c => c.stage === 'rejected'),
  };

  if (loading) return <div className="loading">Loading candidates...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <div className="candidates-page">
      <div className="candidates-header">
        <h1 className="candidates-title">Candidates</h1>
        <p className="candidates-subtitle">
          Manage candidate applications and track their progress
        </p>
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>Total loaded: {total} candidates</div>
      </div>
      
      <div className="candidates-controls">
        <div className="candidates-filters">
          <input
            type="text"
            placeholder="Search candidates by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
                setCurrentPage(1);
              }
            }}
            className="candidates-search"
          />
          <button
            className="view-btn"
            onClick={() => { setSearch(searchInput); setCurrentPage(1); }}
          >
            Search
          </button>
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
        loading ? (
          <div className="loading">
            Loading candidates...
          </div>
        ) : (
          <div className="candidates-list-container">
            <div className="list-header">
              <span className="candidate-count">
                {(() => {
                  const start = (currentPage - 1) * pageSize + 1;
                  const end = Math.min(currentPage * pageSize, total);
                  return total > 0 ? `Showing ${start}-${end} of ${total}` : 'No results';
                })()}
              </span>
            </div>
            <VirtualizedCandidateList
              candidates={paginatedCandidates}
              onViewProfile={handleViewProfile}
              onAddNote={handleAddNote}
            />
          </div>
        )
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-board">
            {Object.entries(candidatesByStage).map(([stage, stageCandidates]) => (
              <DroppableKanbanColumn
                key={stage}
                stage={stage}
                candidates={stageCandidates}
                onViewProfile={handleViewProfile}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
          {createPortal(
            <DragOverlay>
              {activeId ? (
                <div className="kanban-card dragging">
                  <h4 className="kanban-card-name">
                    {candidates.find(c => c.id === activeId)?.name}
                  </h4>
                  <p className="kanban-card-email">
                    {candidates.find(c => c.id === activeId)?.email}
                  </p>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      )}

      {/* Pagination for List View */}
      {view === 'list' && total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={total}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[25, 50, 100, 250, 500, 1000]}
        />
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
              <MentionInput
                value={noteText}
                onChange={setNoteText}
                placeholder="Enter your note here... Type @ to mention candidates, jobs, or team members"
                rows={6}
                candidates={candidates}
                jobs={[]}
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
                    setSelectedCandidate(null);
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
    </>
  );
};

export default CandidatesPage;