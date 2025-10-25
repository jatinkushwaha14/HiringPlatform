import React, { useState } from 'react';
import type { AssessmentSection, AssessmentQuestion } from '../../types';
import QuestionEditor from './QuestionEditor';
import './SectionManager.css';

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

  const questionTypes: { type: AssessmentQuestion['type']; label: string; icon: string }[] = [
    { type: 'single-choice', label: 'Single Choice', icon: '🔘' },
    { type: 'multi-choice', label: 'Multiple Choice', icon: '☑️' },
    { type: 'short-text', label: 'Short Text', icon: '📝' },
    { type: 'long-text', label: 'Long Text', icon: '📄' },
    { type: 'numeric', label: 'Numeric', icon: '🔢' },
    { type: 'file-upload', label: 'File Upload', icon: '📎' }
  ];

  return (
    <div className="section-manager">
      <div className="section-header">
        <div className="section-title-section">
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdateSection({ title: e.target.value })}
            className="section-title-input"
            placeholder="Section Title"
          />
        </div>
        <div className="section-actions">
          <button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            className="add-question-btn"
          >
            + Add Question
          </button>
          <button
            onClick={onDeleteSection}
            className="delete-section-btn"
            title="Delete Section"
          >
            🗑️
          </button>
        </div>
      </div>

      {showAddQuestion && (
        <div className="question-type-selector">
          <h4>Choose Question Type:</h4>
          <div className="question-types-grid">
            {questionTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => {
                  onAddQuestion(type);
                  setShowAddQuestion(false);
                }}
                className="question-type-btn"
              >
                <span className="question-type-icon">{icon}</span>
                <span className="question-type-label">{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddQuestion(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
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
