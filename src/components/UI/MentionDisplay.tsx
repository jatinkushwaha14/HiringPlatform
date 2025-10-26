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
    // Updated regex to better match job titles and names with spaces
    // Matches @ followed by words, allowing spaces, hyphens, and common job title characters
    const mentionRegex = /@([A-Za-z][A-Za-z\s\-&\.]*[A-Za-z]|[A-Za-z])/g;
    const parts: ParsedMention[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          type: 'text'
        });
      }

      const mentionName = match[1].trim();
      
      // Find the mention in our data - use more flexible matching
      const candidate = candidates.find(c => 
        c.name.toLowerCase().includes(mentionName.toLowerCase()) ||
        mentionName.toLowerCase().includes(c.name.toLowerCase())
      );
      const job = jobs.find(j => 
        j.title.toLowerCase().includes(mentionName.toLowerCase()) ||
        mentionName.toLowerCase().includes(j.title.toLowerCase())
      );
      const teamMember = teamMembers.find(m => 
        m.toLowerCase().includes(mentionName.toLowerCase()) ||
        mentionName.toLowerCase().includes(m.toLowerCase())
      );

      if (candidate) {
        parts.push({
          text: `@${mentionName}`,
          type: 'mention',
          mentionType: 'candidate',
          mentionId: candidate.id,
          mentionName: candidate.name
        });
      } else if (job) {
        parts.push({
          text: `@${mentionName}`,
          type: 'mention',
          mentionType: 'job',
          mentionId: job.id,
          mentionName: job.title
        });
      } else if (teamMember) {
        parts.push({
          text: `@${mentionName}`,
          type: 'mention',
          mentionType: 'team',
          mentionId: teamMember,
          mentionName: teamMember
        });
      } else {
        // Mention not found, display as regular text
        parts.push({
          text: `@${mentionName}`,
          type: 'text'
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        type: 'text'
      });
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
          
          // Use onClick handler as fallback for navigation
          const handleMentionClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (url !== '#') {
              window.location.href = url;
            }
          };
          
          return (
            <Link
              key={index}
              to={url}
              className={`mention-tag ${part.mentionType}`}
              title={`${icon} ${part.mentionName}`}
              onClick={handleMentionClick}
            >
              {part.text}
            </Link>
          );
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
