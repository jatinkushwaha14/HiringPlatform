import React, { useMemo } from 'react';
import { List } from 'react-window';
import { Link } from 'react-router-dom';
import type { Candidate } from '../../types';
import './VirtualizedCandidateList.css';

interface VirtualizedCandidateListProps {
  candidates: Candidate[];
  onViewProfile: (candidate: Candidate) => void;
  onAddNote: (candidate: Candidate) => void;
}

interface CandidateItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    candidates: Candidate[];
    onViewProfile: (candidate: Candidate) => void;
    onAddNote: (candidate: Candidate) => void;
  };
}

const CandidateItem: React.FC<CandidateItemProps> = ({ index, style, data }) => {
  const { candidates, onViewProfile, onAddNote } = data;

  // Add safety checks
  if (!candidates || !Array.isArray(candidates) || index >= candidates.length) {
    return <div style={style} className="candidate-item-loading">Loading...</div>;
  }

  const candidate = candidates[index];

  if (!candidate) {
    return <div style={style} className="candidate-item-loading">Loading...</div>;
  }

  return (
    <div style={style} className="virtualized-candidate-item">
      <div className="candidate-info">
        <Link to={`/candidates/${candidate.id}`} className="candidate-name">
          {candidate.name}
        </Link>
        <p className="candidate-email">{candidate.email}</p>
        <span className={`candidate-stage ${candidate.stage}`}>
          {candidate.stage}
        </span>
      </div>
      <div className="candidate-actions">
        <button 
          className="action-btn"
          onClick={() => onViewProfile(candidate)}
        >
          View
        </button>
        <button 
          className="action-btn"
          onClick={() => onAddNote(candidate)}
        >
          Note
        </button>
      </div>
    </div>
  );
};

const VirtualizedCandidateList: React.FC<VirtualizedCandidateListProps> = ({
  candidates,
  onViewProfile,
  onAddNote
}) => {
  // Ensure we always have a valid array with useMemo for performance
  const safeCandidates = useMemo(() => {
    return Array.isArray(candidates) ? candidates : [];
  }, [candidates]);
  
  const itemData = useMemo(() => ({
    candidates: safeCandidates,
    onViewProfile,
    onAddNote
  }), [safeCandidates, onViewProfile, onAddNote]);

  if (safeCandidates.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3 className="empty-title">No candidates found</h3>
        <p className="empty-message">
          Try adjusting your search or filters, or generate sample data
        </p>
      </div>
    );
  }

  return (
    <div className="virtualized-candidate-list">
      <div className="list-header">
        <span className="candidate-count">
          Showing {safeCandidates.length} candidate{safeCandidates.length !== 1 ? 's' : ''}
        </span>
        <span className="performance-note">
          ⚡ Virtualized for optimal performance
        </span>
      </div>
      
      <List
        height={600} // Fixed height for the virtualized list
        itemCount={safeCandidates.length}
        itemSize={80} // Height of each candidate item
        itemData={itemData}
        className="candidate-list-container"
      >
        {CandidateItem}
      </List>
    </div>
  );
};

export default VirtualizedCandidateList;
