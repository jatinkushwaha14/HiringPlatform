import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchJobs, createJob, updateJob, reorderJob } from '../store/slices/jobsSlice';
import JobForm from '../components/Jobs/JobForm';
import Pagination from '../components/legacy-ui/Pagination';
import type { Job } from '../types/index.ts';
import './JobsPage.css';
import { Button } from '@/shadcn/ui/button';
import { Input } from '@/shadcn/ui/input';
import { Badge } from '@/shadcn/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shadcn/ui/select';

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
    <Card
      ref={setNodeRef}
      style={style}
      className={`job-card ${job.status === 'archived' ? 'archived' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="job-header">
        <div className="job-header">
          <Link to={`/jobs/${job.id}`} className="job-title-link">
            <CardTitle className="job-title">{job.title}</CardTitle>
          </Link>
          <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className={`job-status ${job.status}`}>
            {job.status}
          </Badge>
        </div>
        <p className="job-slug">#{job.slug}</p>
      </CardHeader>
      <CardContent className="job-content">
        <div className="job-info">
          <div className="job-tags">
            {job.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="job-tag">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="job-actions">
          <div className="job-buttons">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              variant="secondary"
              size="sm"
            >
              Edit
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(job);
              }}
              variant={job.status === 'active' ? 'outline' : 'default'}
              size="sm"
            >
              {job.status === 'active' ? 'Archive' : 'Unarchive'}
            </Button>
          </div>
          <div className="job-order">Order: {job.order}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const JobsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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
    dispatch(fetchJobs({
      search,
      status: statusFilter,
      page: currentPage,
      pageSize,
      sort: 'order',
      tags: selectedTags,
    }));
  }, [dispatch, search, statusFilter, currentPage, pageSize, selectedTags]);

  const filteredJobs = jobs; // server-like filtering handled by API
  const totalPages = Math.ceil((useAppSelector((s) => s.jobs.total) || 0) / pageSize);
  const paginatedJobs = filteredJobs; // already paginated by API

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedTags.join(',')]);

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
      const res = await dispatch(updateJob({ id: editingJob.id, updates: jobData }));
      if ('error' in res) {
        const anyRes = res as unknown as { payload?: string };
        alert(anyRes.payload || 'Failed to update job');
        return;
      }
    } else {
      const res = await dispatch(createJob(jobData));
      if ('error' in res) {
        const anyRes = res as unknown as { payload?: string };
        alert(anyRes.payload || 'Failed to create job');
        return;
      }
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

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);
      const fromOrder = paginatedJobs.find((j) => String(j.id) === activeId)?.order;
      const toOrder = paginatedJobs.find((j) => String(j.id) === overId)?.order;
      if (fromOrder && toOrder) {
        const res = await dispatch(reorderJob({ id: activeId, fromOrder, toOrder }));
        if ('error' in res) {
          alert('Reorder failed. Changes rolled back.');
          dispatch(fetchJobs({
            search,
            status: statusFilter,
            page: currentPage,
            pageSize,
            sort: 'order',
            tags: selectedTags,
          }));
        }
      }
    }
  };
  // Keep rendering list; show inline indicators instead of full-page loading

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
          <Input
            type="text"
            placeholder="Search jobs by title or tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
                setCurrentPage(1);
              }
            }}
            className="jobs-search"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="jobs-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setSearch(searchInput);
              setCurrentPage(1);
            }}
            className="jobs-filter"
            size="sm"
          >
            Search
          </Button>
          <Input
            type="text"
            placeholder="Filter by tags (comma-separated)"
            value={selectedTags.join(', ')}
            onChange={(e) => setSelectedTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            className="jobs-filter jobs-tags-input"
          />
          <Button onClick={handleCreateJob} className="create-job-btn" size="sm">
            + Create Job
          </Button>
        </div>
        {loading && (
          <div style={{ fontSize: 12, color: '#666' }}>Loading…</div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: '#b00020' }}>Error: {error}</div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={paginatedJobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className="jobs-list">
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3 className="empty-title">No jobs found</h3>
                <p className="empty-message">
                  {search || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first job posting to get started'
                  }
                </p>
              </div>
            ) : (
              paginatedJobs.map((job) => (
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
                        {paginatedJobs.find(job => job.id === activeId)?.title}
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

      {filteredJobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={filteredJobs.length}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

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