import React, { useState } from 'react';
import type { AssessmentSection, AssessmentQuestion } from '../../types';
import QuestionEditor from './QuestionEditor';
import './SectionManager.css';
import { Button } from '@/shadcn/ui/button';
import { Input } from '@/shadcn/ui/input';

interface SectionManagerProps {
  section: AssessmentSection;
  onUpdateSection: (updates: Partial<AssessmentSection>) => void;
  onDeleteSection: () => void;
  onAddQuestion: (questionType: AssessmentQuestion['type']) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<AssessmentQuestion>) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const SectionManager: React.FC<SectionManagerProps> = ({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion
}) => {
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const questionTypes: { type: AssessmentQuestion['type']; label: string }[] = [
    { type: 'single-choice', label: 'Single Choice' },
    { type: 'multi-choice', label: 'Multiple Choice' },
    { type: 'short-text', label: 'Short Text' },
    { type: 'long-text', label: 'Long Text' },
    { type: 'numeric', label: 'Numeric' },
    { type: 'file-upload', label: 'File Upload' }
  ];

  return (
    <div className="section-manager">
      <div className="section-header">
        <div className="section-title-section">
          <Input
            value={section.title}
            onChange={(e) => onUpdateSection({ title: e.target.value })}
            className="section-title-input"
            placeholder="Section Title"
          />
        </div>
        <div className="section-actions">
          <Button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            className="add-question-btn"
            size="sm"
          >
            Add Question
          </Button>
          <Button
            onClick={onDeleteSection}
            className="delete-section-btn"
            variant="destructive"
            size="sm"
            title="Delete Section"
          >
            Delete
          </Button>
        </div>
      </div>

      {showAddQuestion && (
        <div className="question-type-selector">
          <h4>Choose Question Type:</h4>
          <div className="question-types-grid">
            {questionTypes.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => {
                  onAddQuestion(type);
                  setShowAddQuestion(false);
                }}
                className="question-type-btn"
              >
                <span className="question-type-label">{label}</span>
              </button>
            ))}
          </div>
          <Button
            onClick={() => setShowAddQuestion(false)}
            className="cancel-btn"
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="questions-list">
        {section.questions.length === 0 ? (
          <div className="no-questions">
            <p>No questions yet. Click "Add Question" to get started.</p>
          </div>
        ) : (
          section.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              questionNumber={index + 1}
              onUpdateQuestion={(updates) => onUpdateQuestion(question.id, updates)}
              onDeleteQuestion={() => onDeleteQuestion(question.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SectionManager;
