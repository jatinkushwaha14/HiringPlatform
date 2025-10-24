import React, { useState } from 'react';
import type { Job } from '../../types/index.ts';
import './JobForm.css';
interface JobFormProps {
  job?: Job;
  onSubmit: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(job?.title || '');
  const [slug, setSlug] = useState(job?.slug || '');
  const [status, setStatus] = useState<'active' | 'archived'>(job?.status || 'active');
  const [tags, setTags] = useState(job?.tags.join(', ') || '');
  const [order, setOrder] = useState(job?.order || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    const jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-'),
      status,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      order,
    };

    onSubmit(jobData);
  };

  return (
    <div className="job-form-overlay">
      <div className="job-form-modal">
        <div className="job-form-header">
          <h2 className="job-form-title">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <p className="job-form-subtitle">
            {job ? 'Update the job details below' : 'Fill in the details to create a new job posting'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="job-form-field">
            <label className="job-form-label">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="job-form-input"
              placeholder="e.g. Senior Frontend Developer"
              required
            />
          </div>

          <div className="job-form-field">
            <label className="job-form-label">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="job-form-input"
              placeholder="auto-generated from title"
            />
            <p className="job-form-help">
              This will be used in the job URL: /jobs/{slug || 'auto-generated'}
            </p>
          </div>

          <div className="job-form-field">
            <label className="job-form-label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'archived')}
              className="job-form-select"
            >
              <option value="active">Active - Accepting applications</option>
              <option value="archived">Archived - Not accepting applications</option>
            </select>
          </div>

          <div className="job-form-field">
            <label className="job-form-label">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="job-form-input"
              placeholder="React, TypeScript, Frontend, Remote"
            />
            <p className="job-form-help">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="job-form-field">
            <label className="job-form-label">Display Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="job-form-input"
              placeholder="0"
            />
            <p className="job-form-help">
              Lower numbers appear first in the jobs list
            </p>
          </div>

          <div className="job-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="job-form-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="job-form-submit"
            >
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;