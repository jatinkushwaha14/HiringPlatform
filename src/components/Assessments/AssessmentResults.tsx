import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import type { Assessment, AssessmentResponse } from '../../types';
import './AssessmentResults.css';

interface AssessmentResultsProps {
  assessment: Assessment;
  response: AssessmentResponse;
  candidateName?: string;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  response,
  candidateName
}) => {
  const getScoreForQuestion = (question: any, answer: any) => {
    // Simple scoring logic - in a real app, this would be more sophisticated
    if (!answer) return 0;
    
    switch (question.type) {
      case 'single-choice':
        // If no correct answer is set, give partial credit for any answer
        if (!question.correctAnswer) return 0.5;
        return answer === question.correctAnswer ? 1 : 0;
      case 'multi-choice':
        if (!Array.isArray(answer)) return 0;
        // If no correct answers are set, give partial credit for any answer
        if (!question.correctAnswers || question.correctAnswers.length === 0) {
          return answer.length > 0 ? 0.5 : 0;
        }
        const correctCount = question.correctAnswers.filter((correct: string) => 
          answer.includes(correct)
        ).length;
        return correctCount / question.correctAnswers.length;
      case 'short-text':
      case 'long-text':
        // Improved scoring for text answers
        const textLength = answer.toString().length;
        if (textLength === 0) return 0;
        if (textLength < 5) return 0.2; // Very short answers
        if (textLength < 10) return 0.5; // Short answers
        if (textLength < 20) return 0.7; // Medium answers
        return 1; // Good length answers get full points
      case 'numeric':
        const numAnswer = parseFloat(answer);
        if (isNaN(numAnswer)) return 0;
        if (question.min !== undefined && question.max !== undefined) {
          const range = question.max - question.min;
          const normalized = (numAnswer - question.min) / range;
          return Math.max(0, Math.min(1, normalized));
        }
        return 1;
      default:
        return 1; // File uploads and other types get full points
    }
  };

  const calculateSectionScore = (section: any) => {
    const questions = section.questions;
    const totalScore = questions.reduce((sum: number, question: any) => {
      const answer = response.responses[question.id];
      return sum + getScoreForQuestion(question, answer);
    }, 0);
    return {
      score: totalScore,
      maxScore: questions.length,
      percentage: Math.round((totalScore / questions.length) * 100)
    };
  };

  const calculateOverallScore = () => {
    const sectionScores = assessment.sections.map(calculateSectionScore);
    const totalScore = sectionScores.reduce((sum, section) => sum + section.score, 0);
    const maxScore = sectionScores.reduce((sum, section) => sum + section.maxScore, 0);
    return {
      score: totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100)
    };
  };

  const overallScore = calculateOverallScore();

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    return '#dc3545';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="assessment-results">
      <div className="results-header">
        <h2 className="results-title">Assessment Results</h2>
        <div className="results-meta">
          <div className="assessment-info">
            <h3 className="assessment-name">{assessment.title}</h3>
            {candidateName && (
              <p className="candidate-name">Completed by: {candidateName}</p>
            )}
            <p className="completion-date">
              Submitted: {formatDate(response.submittedAt)}
            </p>
          </div>
          
          <div className="overall-score">
            <div 
              className="score-circle"
              style={{ 
                background: `conic-gradient(${getScoreColor(overallScore.percentage)} 0deg ${overallScore.percentage * 3.6}deg, #e1e5e9 ${overallScore.percentage * 3.6}deg 360deg)`
              }}
            >
              <div className="score-content">
                <div className="score-percentage">{overallScore.percentage}%</div>
                <div className="score-fraction">
                  {overallScore.score}/{overallScore.maxScore}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sections-results">
        {assessment.sections.map((section, sectionIndex) => {
          const sectionScore = calculateSectionScore(section);
          
          return (
            <div key={section.id} className="section-result">
              <div className="section-header">
                <h4 className="section-title">
                  Section {sectionIndex + 1}: {section.title}
                </h4>
                <div className="section-score">
                  <span 
                    className="score-percentage"
                    style={{ color: getScoreColor(sectionScore.percentage) }}
                  >
                    {sectionScore.percentage}%
                  </span>
                  <span className="score-fraction">
                    ({sectionScore.score}/{sectionScore.maxScore})
                  </span>
                </div>
              </div>

              <div className="questions-results">
                {section.questions.map((question) => {
                  const answer = response.responses[question.id];
                  const questionScore = getScoreForQuestion(question, answer);
                  
                  return (
                    <div key={question.id} className="question-result">
                      <div className="question-header">
                        <h5 className="question-text">{question.question}</h5>
                        <div className="question-score">
                          <span 
                            className="score-indicator"
                            style={{ 
                              backgroundColor: getScoreColor(questionScore * 100),
                              color: 'white'
                            }}
                          >
                            {Math.round(questionScore * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="answer-section">
                        <div className="answer-label">Answer:</div>
                        <div className="answer-content">
                          {Array.isArray(answer) ? (
                            <ul className="answer-list">
                              {answer.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="answer-text">
                              {answer || <em>No answer provided</em>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="results-summary">
        <h4>Summary</h4>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Questions:</span>
            <span className="stat-value">{overallScore.maxScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Answered:</span>
            <span className="stat-value">
              {Object.values(response.responses).filter(answer => 
                answer !== null && answer !== undefined && answer !== ''
              ).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Overall Score:</span>
            <span 
              className="stat-value"
              style={{ color: getScoreColor(overallScore.percentage) }}
            >
              {overallScore.percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
