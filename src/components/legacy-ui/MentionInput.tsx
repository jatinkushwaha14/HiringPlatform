import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Candidate, Job } from '../../types';
import './MentionInput.css';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  candidates?: Candidate[];
  jobs?: Job[];
  teamMembers?: string[];
  onSubmit?: () => void;
}

interface MentionSuggestion {
  id: string;
  type: 'candidate' | 'job' | 'team';
  name: string;
  subtitle?: string;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder = "Add a note...",
  rows = 3,
  candidates = [],
  jobs = [],
  teamMembers = [],
  onSubmit
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate suggestions based on query
  const generateSuggestions = useCallback((query: string): MentionSuggestion[] => {
    const allSuggestions: MentionSuggestion[] = [
      // Candidates
      ...candidates.map(candidate => ({
        id: candidate.id,
        type: 'candidate' as const,
        name: candidate.name,
        subtitle: candidate.email
      })),
      // Jobs
      ...jobs.map(job => ({
        id: job.id,
        type: 'job' as const,
        name: job.title,
        subtitle: job.status
      })),
      // Team members
      ...teamMembers.map(member => ({
        id: member,
        type: 'team' as const,
        name: member,
        subtitle: 'Team Member'
      }))
    ];

    return allSuggestions.filter(suggestion =>
      suggestion.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions
  }, [candidates, jobs, teamMembers]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check for @mentions with improved regex
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([A-Za-z][A-Za-z\s\-&\.]*[A-Za-z]|[A-Za-z])$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setSuggestions(generateSuggestions(query));
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Insert mention
  const insertMention = (suggestion: MentionSuggestion) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    // Find the start of the current @mention
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const textBeforeMention = textBeforeCursor.substring(0, mentionStart);

    // Structured token ensures stable linking: @[type:id|Name]
    const token = `@[${suggestion.type}:${suggestion.id}|${suggestion.name}]`;
    const newValue = textBeforeMention + token + ' ' + textAfterCursor;

    onChange(newValue);
    setShowSuggestions(false);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = textBeforeMention.length + token.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestions[selectedSuggestionIndex]) {
          insertMention(suggestions[selectedSuggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: MentionSuggestion) => {
    insertMention(suggestion);
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: MentionSuggestion['type']): string => {
    switch (type) {
      case 'candidate':
        return '👤';
      case 'job':
        return '💼';
      case 'team':
        return '👥';
      default:
        return '📝';
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mention-input-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="mention-textarea"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="mention-suggestions">
          <div className="suggestions-header">
            <span className="suggestions-title">Mention someone or something</span>
            <span className="suggestions-hint">↑↓ to navigate, Enter to select, Esc to close</span>
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}`}
              className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
              <div className="suggestion-content">
                <div className="suggestion-name">{suggestion.name}</div>
                <div className="suggestion-subtitle">{suggestion.subtitle}</div>
              </div>
              <span className="suggestion-type">{suggestion.type}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mention-input-footer">
        <span className="mention-hint">
          Type @ to mention candidates, jobs, or team members
        </span>
        {onSubmit && (
          <button
            onClick={onSubmit}
            className="mention-submit-btn"
            disabled={!value.trim()}
          >
            Add Note
          </button>
        )}
      </div>
    </div>
  );
};

export default MentionInput;


