import React, { useState } from 'react';
import type { AssessmentQuestion } from '../../types';
import './QuestionEditor.css';

interface QuestionEditorProps {
  question: AssessmentQuestion;
  questionNumber: number;
  onUpdateQuestion: (updates: Partial<AssessmentQuestion>) => void;
  onDeleteQuestion: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionNumber,
  onUpdateQuestion,
  onDeleteQuestion
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleQuestionChange = (field: keyof AssessmentQuestion, value: any) => {
    onUpdateQuestion({ [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdateQuestion({ options: newOptions });
  };

  const handleAddOption = () => {
    if (!question.options) return;
    onUpdateQuestion({ options: [...question.options, ''] });
  };

  const handleRemoveOption = (index: number) => {
    if (!question.options || question.options.length <= 1) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdateQuestion({ options: newOptions });
  };

  const handleCorrectAnswerChange = (value: any) => {
    onUpdateQuestion({ correctAnswer: value });
  };

  const handleCorrectAnswersChange = (value: string[]) => {
    onUpdateQuestion({ correctAnswers: value });
  };

  // Validation: Check if question has correct answers set
  const hasCorrectAnswer = () => {
    if (question.type === 'single-choice') {
      return question.correctAnswer && question.correctAnswer.trim() !== '';
    }
    if (question.type === 'multi-choice') {
      return question.correctAnswers && question.correctAnswers.length > 0;
    }
    // For other question types, correct answers are optional
    return true;
  };

  const isQuestionValid = () => {
    return question.question.trim() !== '' && hasCorrectAnswer();
  };

  const getQuestionTypeIcon = (type: AssessmentQuestion['type']) => {
    const icons = {
      'single-choice': '🔘',
      'multi-choice': '☑️',
      'short-text': '📝',
      'long-text': '📄',
      'numeric': '🔢',
      'file-upload': '📎'
    };
    return icons[type] || '❓';
  };

  const getQuestionTypeLabel = (type: AssessmentQuestion['type']) => {
    const labels = {
      'single-choice': 'Single Choice',
      'multi-choice': 'Multiple Choice',
      'short-text': 'Short Text',
      'long-text': 'Long Text',
      'numeric': 'Numeric',
      'file-upload': 'File Upload'
    };
    return labels[type] || 'Unknown';
  };

  return (
    <div className={`question-editor ${isExpanded ? 'expanded' : ''}`}>
      <div className="question-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="question-info">
          <span className="question-number">Q{questionNumber}</span>
          <span className="question-type-icon">{getQuestionTypeIcon(question.type)}</span>
          <span className="question-type-label">{getQuestionTypeLabel(question.type)}</span>
          {question.question && (
            <span className="question-preview">
              {question.question.length > 50 
                ? `${question.question.substring(0, 50)}...` 
                : question.question || 'Untitled Question'
              }
            </span>
          )}
        </div>
        <div className="question-actions">
          {/* Validation indicators */}
          {!isQuestionValid() && (
            <span className="validation-warning">
              {!question.question.trim() ? 'Missing question text' : 
               !hasCorrectAnswer() ? 'Missing correct answer' : 'Invalid'}
            </span>
          )}
          {isQuestionValid() && (
            <span className="validation-success">✓ Valid</span>
          )}
          <span className="required-indicator">{question.required ? 'Required' : 'Optional'}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteQuestion();
            }}
            className="delete-question-btn"
            title="Delete Question"
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="question-content">
          <div className="question-field">
            <label>Question Text:</label>
            <textarea
              value={question.question}
              onChange={(e) => handleQuestionChange('question', e.target.value)}
              placeholder="Enter your question here..."
              className="question-textarea"
            />
          </div>

          <div className="question-settings">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => handleQuestionChange('required', e.target.checked)}
              />
              Required Question
            </label>
          </div>

          {/* Options for choice questions */}
          {(question.type === 'single-choice' || question.type === 'multi-choice') && (
            <div className="question-options">
              <label>Options:</label>
              {question.options?.map((option, index) => (
                <div key={index} className="option-row">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="option-input"
                  />
                  {question.options && question.options.length > 1 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="remove-option-btn"
                      title="Remove Option"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button onClick={handleAddOption} className="add-option-btn">
                + Add Option
              </button>
            </div>
          )}

          {/* Correct Answer Settings */}
          {(question.type === 'single-choice' || question.type === 'multi-choice') && question.options && question.options.length > 0 && (
            <div className="correct-answer-section">
              <label>Correct Answer(s):</label>
              
              {question.type === 'single-choice' && (
                <select
                  value={question.correctAnswer || ''}
                  onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                  className="correct-answer-select"
                >
                  <option value="">Select correct answer...</option>
                  {question.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {question.type === 'multi-choice' && (
                <div className="multi-choice-correct">
                  {question.options.map((option, index) => (
                    <label key={index} className="correct-option-label">
                      <input
                        type="checkbox"
                        checked={question.correctAnswers?.includes(option) || false}
                        onChange={(e) => {
                          const currentAnswers = question.correctAnswers || [];
                          if (e.target.checked) {
                            handleCorrectAnswersChange([...currentAnswers, option]);
                          } else {
                            handleCorrectAnswersChange(currentAnswers.filter(ans => ans !== option));
                          }
                        }}
                        className="correct-option-checkbox"
                      />
                      <span className="correct-option-text">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Numeric range for numeric questions */}
          {question.type === 'numeric' && (
            <div className="numeric-settings">
              <div className="numeric-field">
                <label>Minimum Value:</label>
                <input
                  type="number"
                  value={question.min || ''}
                  onChange={(e) => handleQuestionChange('min', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="No minimum"
                  className="numeric-input"
                />
              </div>
              <div className="numeric-field">
                <label>Maximum Value:</label>
                <input
                  type="number"
                  value={question.max || ''}
                  onChange={(e) => handleQuestionChange('max', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="No maximum"
                  className="numeric-input"
                />
              </div>
            </div>
          )}

          {/* Max length for text questions */}
          {(question.type === 'short-text' || question.type === 'long-text') && (
            <div className="text-settings">
              <label>Maximum Length:</label>
              <input
                type="number"
                value={question.maxLength || ''}
                onChange={(e) => handleQuestionChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="No limit"
                className="text-length-input"
              />
            </div>
          )}

          {/* Conditional Logic */}
          <div className="conditional-logic">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={!!question.conditionalLogic}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleQuestionChange('conditionalLogic', {
                      dependsOn: '',
                      condition: 'equals',
                      value: ''
                    });
                  } else {
                    handleQuestionChange('conditionalLogic', undefined);
                  }
                }}
              />
              Show this question conditionally
            </label>
            
            {question.conditionalLogic && (
              <div className="conditional-settings">
                <div className="conditional-field">
                  <label>Depends on question:</label>
                  <input
                    type="text"
                    value={question.conditionalLogic.dependsOn}
                    onChange={(e) => handleQuestionChange('conditionalLogic', {
                      ...question.conditionalLogic!,
                      dependsOn: e.target.value
                    })}
                    placeholder="Question ID"
                    className="conditional-input"
                  />
                </div>
                <div className="conditional-field">
                  <label>Condition:</label>
                  <select
                    value={question.conditionalLogic.condition}
                    onChange={(e) => handleQuestionChange('conditionalLogic', {
                      ...question.conditionalLogic!,
                      condition: e.target.value
                    })}
                    className="conditional-select"
                  >
                    <option value="equals">Equals</option>
                    <option value="not-equals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater-than">Greater Than</option>
                    <option value="less-than">Less Than</option>
                  </select>
                </div>
                <div className="conditional-field">
                  <label>Value:</label>
                  <input
                    type="text"
                    value={question.conditionalLogic.value}
                    onChange={(e) => handleQuestionChange('conditionalLogic', {
                      ...question.conditionalLogic!,
                      value: e.target.value
                    })}
                    placeholder="Expected value"
                    className="conditional-input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
