import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { updateAssessment } from '../../store/slices/assessmentsSlice';
import type { Assessment, AssessmentSection, AssessmentQuestion } from '../../types';
import SectionManager from './SectionManager';
import LivePreview from './LivePreview';
import './AssessmentBuilder.css';

interface AssessmentBuilderProps {
  assessment: Assessment;
  onClose: () => void;
}

const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({ assessment, onClose }) => {
  const dispatch = useAppDispatch();
  const [localAssessment, setLocalAssessment] = useState<Assessment>(assessment);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    assessment.sections[0]?.id || ''
  );

  useEffect(() => {
    setLocalAssessment(assessment);
    if (assessment.sections.length > 0) {
      setActiveSectionId(assessment.sections[0].id);
    }
  }, [assessment]);

  const handleUpdateAssessment = (updates: Partial<Assessment>) => {
    const updatedAssessment = { ...localAssessment, ...updates };
    setLocalAssessment(updatedAssessment);
  };

  const handleAddSection = () => {
    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: `Section ${localAssessment.sections.length + 1}`,
      questions: []
    };
    
    const updatedSections = [...localAssessment.sections, newSection];
    handleUpdateAssessment({ sections: updatedSections });
    setActiveSectionId(newSection.id);
  };

  const handleSaveAssessment = async () => {
    try {
      await dispatch(updateAssessment({ 
        id: assessment.id, 
        updates: localAssessment 
      }));
      alert('Assessment saved successfully!');
      // Don't reload - just close the builder
      onClose();
    } catch (error) {
      alert('Failed to save assessment');
      console.error('Save error:', error);
    }
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<AssessmentSection>) => {
    const updatedSections = localAssessment.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    handleUpdateAssessment({ sections: updatedSections });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (localAssessment.sections.length <= 1) {
      alert('Assessment must have at least one section');
      return;
    }
    
    const updatedSections = localAssessment.sections.filter(section => section.id !== sectionId);
    handleUpdateAssessment({ sections: updatedSections });
    
    if (activeSectionId === sectionId) {
      setActiveSectionId(updatedSections[0]?.id || '');
    }
  };

  const handleAddQuestion = (sectionId: string, questionType: AssessmentQuestion['type']) => {
    const newQuestion: AssessmentQuestion = {
      id: crypto.randomUUID(),
      type: questionType,
      question: '',
      required: false,
      options: questionType === 'single-choice' || questionType === 'multi-choice' ? [''] : undefined,
      maxLength: questionType === 'short-text' ? 100 : questionType === 'long-text' ? 1000 : undefined
    };

    const updatedSections = localAssessment.sections.map(section =>
      section.id === sectionId
        ? { ...section, questions: [...section.questions, newQuestion] }
        : section
    );
    handleUpdateAssessment({ sections: updatedSections });
  };

  const handleUpdateQuestion = (sectionId: string, questionId: string, updates: Partial<AssessmentQuestion>) => {
    const updatedSections = localAssessment.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.map(question =>
              question.id === questionId ? { ...question, ...updates } : question
            )
          }
        : section
    );
    handleUpdateAssessment({ sections: updatedSections });
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    const updatedSections = localAssessment.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.filter(question => question.id !== questionId)
          }
        : section
    );
    handleUpdateAssessment({ sections: updatedSections });
  };

  const activeSection = localAssessment.sections.find(section => section.id === activeSectionId);

  return (
    <div className="assessment-builder-overlay">
      <div className="assessment-builder">
        <div className="builder-header">
          <div className="builder-title">
            <h2>Assessment Builder</h2>
            <input
              type="text"
              value={localAssessment.title}
              onChange={(e) => handleUpdateAssessment({ title: e.target.value })}
              className="assessment-title-input"
              placeholder="Assessment Title"
            />
          </div>
          <div className="builder-actions">
            <button onClick={handleSaveAssessment} className="save-btn">
              💾 Save Changes
            </button>
            <button onClick={onClose} className="close-btn">
              ×
            </button>
          </div>
        </div>

        <div className="builder-content">
          <div className="builder-sidebar">
            <div className="sections-list">
              <h3>Sections ({localAssessment.sections.length})</h3>
              {localAssessment.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`section-item ${activeSectionId === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSectionId(section.id)}
                >
                  <span className="section-number">{index + 1}</span>
                  <span className="section-title">{section.title}</span>
                  <span className="section-questions">{section.questions.length} questions</span>
                </div>
              ))}
              <button onClick={handleAddSection} className="add-section-btn">
                + Add Section
              </button>
            </div>
          </div>

          <div className="builder-main">
            {activeSection ? (
              <SectionManager
                section={activeSection}
                onUpdateSection={(updates) => handleUpdateSection(activeSectionId, updates)}
                onDeleteSection={() => handleDeleteSection(activeSectionId)}
                onAddQuestion={(questionType) => handleAddQuestion(activeSectionId, questionType)}
                onUpdateQuestion={(questionId, updates) => handleUpdateQuestion(activeSectionId, questionId, updates)}
                onDeleteQuestion={(questionId) => handleDeleteQuestion(activeSectionId, questionId)}
              />
            ) : (
              <div className="no-section-selected">
                <p>Select a section to start building your assessment</p>
              </div>
            )}
          </div>

          <div className="builder-preview">
            <h3>Live Preview</h3>
            <LivePreview assessment={localAssessment} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBuilder;
