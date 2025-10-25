import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchJobs, createJob, updateJob } from '../store/slices/jobsSlice';
import JobForm from '../components/Jobs/JobForm';
import type { Job } from '../types/index.ts';
import './JobsPage.css';

// Sortable Job Card Component
const SortableJobCard: React.FC<{ job: Job; onEdit: (job: Job) => void; onArchive: (job: Job) => void }> = ({ job, onEdit, onArchive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`job-card ${job.status === 'archived' ? 'archived' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="job-content">
        <div className="job-info">
          <div className="job-header">
            <h3 className="job-title">{job.title}</h3>
            <span className={`job-status ${job.status}`}>
              {job.status}
            </span>
          </div>
          
          <p className="job-slug">
            #{job.slug}
          </p>
          
          <div className="job-tags">
            {job.tags.map((tag, index) => (
              <span key={index} className="job-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="job-actions">
          <div className="job-buttons">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              className="job-btn"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(job);
              }}
              className={`job-btn ${job.status === 'active' ? 'archive' : 'unarchive'}`}
            >
              {job.status === 'active' ? 'Archive' : 'Unarchive'}
            </button>
          </div>
          
          <div className="job-order">
            Order: {job.order}
          </div>
        </div>
      </div>
    </div>
  );
};

const JobsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  React.useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = () => {
    setEditingJob(undefined);
    setShowForm(true);
  };
  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleSubmitJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingJob) {
      await dispatch(updateJob({ id: editingJob.id, updates: jobData }));
    } else {
      await dispatch(createJob(jobData));
    }
    setShowForm(false);
    setEditingJob(undefined);
  };

  const handleArchiveJob = async (job: Job) => {
    await dispatch(updateJob({ 
      id: job.id, 
      updates: { status: job.status === 'active' ? 'archived' : 'active' } 
    }));
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over.id) {
      const oldIndex = filteredJobs.findIndex((job) => job.id === active.id);
      const newIndex = filteredJobs.findIndex((job) => job.id === over.id);
      
      const reorderedJobs = arrayMove(filteredJobs, oldIndex, newIndex);
      
      // Update order values
      const updatedJobs = reorderedJobs.map((job, index) => ({
        ...job,
        order: index + 1
      }));

      // Optimistic update - update local state immediately
      // In a real app, you'd dispatch an action to update the Redux store
      console.log('Reordering jobs:', updatedJobs);
      
      // Simulate API call with potential failure
      try {
        // Simulate 10% failure rate as per assignment requirements
        if (Math.random() < 0.1) {
          throw new Error('Simulated API failure');
        }
        
        // Update each job's order in the database
        for (const job of updatedJobs) {
          await dispatch(updateJob({ 
            id: job.id, 
            updates: { order: job.order } 
          }));
        }
      } catch (error) {
        console.error('Failed to reorder jobs:', error);
        // Rollback - refresh the jobs to get the original order
        dispatch(fetchJobs());
      }
    }
  };
  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1 className="jobs-title">Jobs Board</h1>
        <p className="jobs-subtitle">
          Manage your job postings and track applications
        </p>
      </div>
      
      <div className="jobs-controls">
        <div className="jobs-filters">
          <input
            type="text"
            placeholder="Search jobs by title or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="jobs-search"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="jobs-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button
          onClick={handleCreateJob}
          className="create-job-btn"
        >
          + Create Job
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredJobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className="jobs-list">
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">No jobs found</h3>
                <p className="empty-message">
                  {search || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first job posting to get started'
                  }
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <SortableJobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  onArchive={handleArchiveJob}
                />
              ))
            )}
          </div>
        </SortableContext>
        {createPortal(
          <DragOverlay>
            {activeId ? (
              <div className="job-card dragging">
                <div className="job-content">
                  <div className="job-info">
                    <div className="job-header">
                      <h3 className="job-title">
                        {filteredJobs.find(job => job.id === activeId)?.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {showForm && (
        <JobForm
          job={editingJob}
          onSubmit={handleSubmitJob}
          onCancel={() => {
            setShowForm(false);
            setEditingJob(undefined);
          }}
        />
      )}
    </div>
  );
};

export default JobsPage;