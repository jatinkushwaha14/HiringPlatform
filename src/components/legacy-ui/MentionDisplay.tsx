import React from 'react';
import { Link } from 'react-router-dom';
import type { Candidate, Job } from '../../types';
import './MentionDisplay.css';

interface MentionDisplayProps {
  text: string;
  candidates?: Candidate[];
  jobs?: Job[];
  teamMembers?: string[];
}

interface ParsedMention {
  text: string;
  type: 'text' | 'mention';
  mentionType?: 'candidate' | 'job' | 'team';
  mentionId?: string;
  mentionName?: string;
}

const MentionDisplay: React.FC<MentionDisplayProps> = ({
  text,
  candidates = [],
  jobs = [],
  teamMembers = []
}) => {
  // Parse text and extract mentions
  const parseMentions = (text: string): ParsedMention[] => {
    const parts: ParsedMention[] = [];
    // Parse structured tokens: @[type:id|Name]
    const tokenRegex = /@\[(candidate|job|team):([^|\]]+)\|([^\]]+)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.index), type: 'text' });
      }
      const mentionType = match[1] as 'candidate' | 'job' | 'team';
      const mentionId = match[2].trim();
      const mentionName = match[3].trim();

      // Always trust structured tokens for navigation. Do not validate against
      // currently loaded lists because data may be paginated or not yet loaded.
      parts.push({
        text: `@${mentionName}`,
        type: 'mention',
        mentionType,
        mentionId,
        mentionName,
      });

      lastIndex = match.index + match[0].length;
    }

    // Remaining text (without structured tokens) may contain simple mentions
    // Only process simple mentions if they're NOT part of a structured token
    const remaining = text.substring(lastIndex);
    const simpleRegex = /@([A-Za-z][A-Za-z\s\-&\.]*[A-Za-z]|[A-Za-z])/g;
    let simpleLast = 0;
    
    // Reset regex for remaining text
    simpleRegex.lastIndex = 0;
    
    while ((match = simpleRegex.exec(remaining)) !== null) {
      // Skip if this mention is part of a structured token (shouldn't happen if parsing worked, but safety check)
      if (match[0].includes('[') && match[0].includes(']')) {
        continue;
      }
      
      if (match.index > simpleLast) {
        parts.push({ text: remaining.substring(simpleLast, match.index), type: 'text' });
      }
      const mentionName = match[1].trim();
      const q = mentionName.toLowerCase().trim();
      
      // Stricter matching: prioritize exact matches, then very close matches
      // This prevents matching the wrong candidate when multiple similar names exist
      const candidate =
        // First try exact match (case-insensitive)
        candidates.find(c => c.name.toLowerCase().trim() === q) ||
        // Then try if the mention exactly matches the start of the candidate's name
        (q.length >= 3 && candidates.find(c => {
          const candidateName = c.name.toLowerCase().trim();
          return candidateName.startsWith(q) && candidateName.length <= q.length + 2;
        })) ||
        // Last resort: very strict substring match (mention must be at least 4 chars and be a word boundary match)
        (q.length >= 4 && candidates.find(c => {
          const candidateName = c.name.toLowerCase().trim();
          // Check if mention is at the start of candidate name or at a word boundary
          return candidateName === q || 
                 candidateName.startsWith(q + ' ') ||
                 candidateName.replace(/\s+/g, '').startsWith(q.replace(/\s+/g, ''));
        }));
      
      const job =
        jobs.find(j => j.title.toLowerCase().trim() === q) ||
        (q.length >= 3 && jobs.find(j => {
          const jobTitle = j.title.toLowerCase().trim();
          return jobTitle.startsWith(q) && jobTitle.length <= q.length + 2;
        })) ||
        (q.length >= 4 && jobs.find(j => {
          const jobTitle = j.title.toLowerCase().trim();
          return jobTitle === q || 
                 jobTitle.startsWith(q + ' ') ||
                 jobTitle.replace(/\s+/g, '').startsWith(q.replace(/\s+/g, ''));
        }));
      
      const teamMember = teamMembers.find(m => m.toLowerCase().trim() === q) || 
                         (q.length >= 3 && teamMembers.find(m => m.toLowerCase().trim().startsWith(q)));

      if (candidate) {
        parts.push({ text: `@${mentionName}`, type: 'mention', mentionType: 'candidate', mentionId: candidate.id, mentionName: candidate.name });
      } else if (job) {
        parts.push({ text: `@${mentionName}`, type: 'mention', mentionType: 'job', mentionId: job.id, mentionName: job.title });
      } else if (teamMember) {
        parts.push({ text: `@${mentionName}`, type: 'mention', mentionType: 'team', mentionId: teamMember, mentionName: teamMember });
      } else {
        // No match found - don't make it a clickable mention
        parts.push({ text: `@${mentionName}`, type: 'text' });
      }
      simpleLast = match.index + match[0].length;
    }

    if (simpleLast < remaining.length) {
      parts.push({ text: remaining.substring(simpleLast), type: 'text' });
    }

    return parts;
  };

  const parsedParts = parseMentions(text);

  const getMentionUrl = (mentionType: string, mentionId: string): string => {
    switch (mentionType) {
      case 'candidate':
        return `/candidates/${mentionId}`;
      case 'job':
        return `/jobs/${mentionId}`;
      case 'team':
        return '#'; // Team members don't have detail pages yet
      default:
        return '#';
    }
  };

  const getMentionIcon = (mentionType: string): string => {
    switch (mentionType) {
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

  return (
    <div className="mention-display">
      {parsedParts.map((part, index) => {
        if (part.type === 'mention' && part.mentionType && part.mentionId) {
          const url = getMentionUrl(part.mentionType, part.mentionId);
          const icon = getMentionIcon(part.mentionType);
          
          // Only render as link if URL is valid
          if (url !== '#') {
            return (
              <Link
                key={index}
                to={url}
                className={`mention-tag ${part.mentionType}`}
                title={`${icon} ${part.mentionName}`}
              >
                {part.text}
              </Link>
            );
          } else {
            // For team members or invalid mentions, render as plain text with styling
            return (
              <span
                key={index}
                className={`mention-tag ${part.mentionType} disabled`}
                title={`${icon} ${part.mentionName}`}
              >
                {part.text}
              </span>
            );
          }
        } else {
          return (
            <span key={index} className="mention-text">
              {part.text}
            </span>
          );
        }
      })}
    </div>
  );
};

export default MentionDisplay;


