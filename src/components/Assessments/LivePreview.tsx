import React, { useState } from 'react';
import type { Assessment, AssessmentQuestion } from '../../types';
import './LivePreview.css';

interface LivePreviewProps {
  assessment: Assessment;
}

const LivePreview: React.FC<LivePreviewProps> = ({ assessment }) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showValidation, setShowValidation] = useState(false);


  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const shouldShowQuestion = (question: AssessmentQuestion): boolean => {
    if (!question.conditionalLogic) return true;
    
    const { dependsOn, condition, value } = question.conditionalLogic;
    const dependentResponse = responses[dependsOn];
    
    if (dependentResponse === undefined) return false;
    
    switch (condition) {
      case 'equals':
        return dependentResponse === value;
      case 'not-equals':
        return dependentResponse !== value;
      case 'contains':
        return String(dependentResponse).includes(String(value));
      case 'greater-than':
        return Number(dependentResponse) > Number(value);
      case 'less-than':
        return Number(dependentResponse) < Number(value);
      default:
        return true;
    }
  };

  const validateQuestion = (question: AssessmentQuestion): string | null => {
    const response = responses[question.id];
    
    if (question.required && (response === undefined || response === '' || response === null)) {
      return 'This field is required';
    }
    
    if (response !== undefined && response !== '' && response !== null) {
      if (question.type === 'numeric') {
        const num = Number(response);
        if (isNaN(num)) return 'Please enter a valid number';
        if (question.min !== undefined && num < question.min) {
          return `Value must be at least ${question.min}`;
        }
        if (question.max !== undefined && num > question.max) {
          return `Value must be at most ${question.max}`;
        }
      }
      
      if (question.type === 'short-text' || question.type === 'long-text') {
        const text = String(response);
        if (question.maxLength && text.length > question.maxLength) {
          return `Text must be no more than ${question.maxLength} characters`;
        }
      }
    }
    
    return null;
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    if (!shouldShowQuestion(question)) return null;
    
    const validationError = showValidation ? validateQuestion(question) : null;
    const hasError = !!validationError;
    
    return (
      <div key={question.id} className={`preview-question ${hasError ? 'error' : ''}`}>
        <label className="preview-question-label">
          {question.question}
          {question.required && <span className="required-asterisk">*</span>}
        </label>
        
        {hasError && <div className="validation-error">{validationError}</div>}
        
        {question.type === 'single-choice' && (
          <div className="preview-options">
            {question.options?.map((option, index) => (
              <label key={index} className="preview-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'multi-choice' && (
          <div className="preview-options">
            {question.options?.map((option, index) => (
              <label key={index} className="preview-option">
                <input
                  type="checkbox"
                  checked={responses[question.id]?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = responses[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'short-text' && (
          <input
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            maxLength={question.maxLength}
            className="preview-input"
            placeholder="Enter your answer..."
          />
        )}
        
        {question.type === 'long-text' && (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            maxLength={question.maxLength}
            className="preview-textarea"
            placeholder="Enter your answer..."
            rows={4}
          />
        )}
        
        {question.type === 'numeric' && (
          <input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            min={question.min}
            max={question.max}
            className="preview-input"
            placeholder="Enter a number..."
          />
        )}
        
        {question.type === 'file-upload' && (
          <div className="preview-file-upload">
            <input
              type="file"
              onChange={(e) => handleResponseChange(question.id, e.target.files?.[0]?.name || '')}
              className="preview-file-input"
            />
            <div className="file-upload-hint">
              Click to select a file (stub implementation)
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = () => {
    setShowValidation(true);
    
    // Check for validation errors
    const hasErrors = assessment.sections.some(section =>
      section.questions.some(question => {
        if (!shouldShowQuestion(question)) return false;
        return validateQuestion(question) !== null;
      })
    );
    
    if (hasErrors) {
      alert('Please fix the validation errors before submitting');
      return;
    }
    
    console.log('Assessment responses:', responses);
    alert('Assessment submitted successfully! (This is a preview)');
    setResponses({}); // Reset form
  };

  // Safety check
  if (!assessment) {
    return <div className="live-preview">No assessment data available</div>;
  }

  return (
    <div className="live-preview">
      <div className="preview-header">
        <h3>{assessment.title || 'Untitled Assessment'}</h3>
        <div className="preview-actions">
          <button
            onClick={() => setShowValidation(!showValidation)}
            className="validation-toggle"
          >
            {showValidation ? 'Hide' : 'Show'} Validation
          </button>
        </div>
      </div>
      
      <div className="preview-content">
        {assessment.sections && assessment.sections.length > 0 ? assessment.sections.map((section, sectionIndex) => (
          <div key={section.id} className="preview-section">
            <h4 className="preview-section-title">
              Section {sectionIndex + 1}: {section.title}
            </h4>
            
            {section.questions.length === 0 ? (
              <p className="no-questions">No questions in this section yet.</p>
            ) : (
              <div className="preview-questions">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="preview-question-wrapper">
                    <div className="question-number">Q{questionIndex + 1}</div>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )) : (
          <div className="no-sections">
            <p>No sections created yet. Add sections and questions to see the preview.</p>
          </div>
        )}
      </div>
      
      <div className="preview-footer">
        <button onClick={handleSubmit} className="submit-btn">
          Submit Assessment
        </button>
        <div className="preview-note">
          This is a live preview. Changes in the builder will be reflected here.
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
