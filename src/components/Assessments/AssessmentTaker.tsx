import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchAssessmentResponse, 
  saveAssessmentResponse, 
  submitAssessmentResponse,
  updateCurrentResponse 
} from '../../store/slices/assessmentResponsesSlice';
import type { Assessment, AssessmentQuestion, AssessmentResponse, QuestionResponseValue } from '../../types';
import './AssessmentTaker.css';

interface AssessmentTakerProps {
  assessment: Assessment;
  candidateId: string;
  onComplete?: (responseId: string) => void;
  onCancel?: () => void;
}

const AssessmentTaker: React.FC<AssessmentTakerProps> = ({
  assessment,
  candidateId,
  onComplete,
  onCancel
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.assessmentResponses);
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponseValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentSection = assessment.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === assessment.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Load existing response on mount
  useEffect(() => {
    const loadExistingResponse = async () => {
      try {
        const result = await dispatch(fetchAssessmentResponse({ 
          assessmentId: assessment.id, 
          candidateId 
        }));
        
        if (result.payload && typeof result.payload === 'object' && 'responses' in result.payload) {
          setResponses((result.payload as AssessmentResponse).responses || {});
        } else {
          // No existing response - start fresh
          setResponses({});
        }
      } catch (error) {
        console.error('Error loading existing response:', error);
        setResponses({});
      }
    };
    
    loadExistingResponse();
  }, [dispatch, assessment.id, candidateId]);

  // Clear responses when candidate changes
  useEffect(() => {
    setResponses({});
    setCurrentSectionIndex(0);
    setHasUnsavedChanges(false);
  }, [candidateId]);

  // Auto-save responses as user types
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      const timeoutId = setTimeout(() => {
        dispatch(saveAssessmentResponse({
          assessmentId: assessment.id,
          candidateId,
          responses,
          isDraft: true
        }));
        setHasUnsavedChanges(false);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [responses, dispatch, assessment.id, candidateId]);

  const handleResponseChange = (questionId: string, value: QuestionResponseValue) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    setHasUnsavedChanges(true);
    
    // Update current response in Redux
    dispatch(updateCurrentResponse({ [questionId]: value }));
  };

  const handleNextSection = () => {
    if (!isLastSection) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePreviousSection = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(submitAssessmentResponse({
        assessmentId: assessment.id,
        candidateId,
        responses
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        setHasUnsavedChanges(false);
        onComplete?.((result.payload as AssessmentResponse).id);
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="question-options">
            {question.options?.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="option-input"
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-choice': {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="question-options">
            {question.options?.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
                  className="option-input"
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        );
      }

      case 'short-text': {
        const textValue = typeof value === 'string' ? value : '';
        return (
          <input
            type="text"
            value={textValue}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            maxLength={question.maxLength}
            className="text-input"
            placeholder="Enter your answer..."
          />
        );
      }

      case 'long-text': {
        const textValue = typeof value === 'string' ? value : '';
        return (
          <textarea
            value={textValue}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            maxLength={question.maxLength}
            rows={4}
            className="textarea-input"
            placeholder="Enter your detailed answer..."
          />
        );
      }

      case 'numeric': {
        const numValue = typeof value === 'number' ? value : typeof value === 'string' ? value : '';
        return (
          <input
            type="number"
            value={numValue}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            min={question.min}
            max={question.max}
            className="number-input"
            placeholder="Enter a number..."
          />
        );
      }

      case 'file-upload':
        return (
          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // In a real app, you'd upload the file and store the URL
                  handleResponseChange(question.id, file.name);
                }
              }}
              className="file-input"
            />
            {value && <div className="file-name">Selected: {value}</div>}
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const getProgressPercentage = () => {
    const totalQuestions = assessment.sections.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = Object.values(responses).filter(answer => 
      answer !== null && answer !== undefined && answer !== ''
    ).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  if (loading) {
    return (
      <div className="assessment-taker">
        <div className="loading">Loading assessment...</div>
      </div>
    );
  }

  return (
    <div className="assessment-taker">
      <div className="assessment-header">
        <h2 className="assessment-title">{assessment.title}</h2>
        <div className="assessment-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <span className="progress-text">
            {getProgressPercentage()}% Complete
          </span>
        </div>
        {hasUnsavedChanges && (
          <div className="unsaved-indicator">Saving...</div>
        )}
      </div>

      <div className="assessment-content">
        <div className="section-header">
          <h3 className="section-title">
            Section {currentSectionIndex + 1}: {currentSection.title}
          </h3>
          <div className="section-progress">
            {currentSectionIndex + 1} of {assessment.sections.length}
          </div>
        </div>

        <div className="questions-container">
          {currentSection.questions.map((question) => (
            <div key={question.id} className="question-item">
              <div className="question-header">
                <h4 className="question-text">{question.question}</h4>
                {question.required && <span className="required-indicator">*</span>}
              </div>
              <div className="question-input">
                {renderQuestion(question)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="assessment-footer">
        <div className="footer-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <div className="navigation-buttons">
            {!isFirstSection && (
              <button
                onClick={handlePreviousSection}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            
            {!isLastSection ? (
              <button
                onClick={handleNextSection}
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                Next Section
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTaker;
