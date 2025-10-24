import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Job } from '../../types/index.ts';
import { db } from '../../services/database';

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  loading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async () => {
    const jobs = await db.jobs.orderBy('order').toArray();
    return jobs;
  }
);

export const createJob = createAsyncThunk(
    'jobs/createJob',
    async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
        const job: Job = {
        ...jobData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        };
        
        await db.jobs.add(job);
        return job;
    }
);
export const updateJob = createAsyncThunk(
    'jobs/updateJob',
    async ({ id, updates }: { id: string; updates: Partial<Job> }) => {
        const updatedJob = { ...updates, updatedAt: new Date().toISOString() };
        await db.jobs.update(id, updatedJob);
        return { id, updates: updatedJob };
    }
);
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.push(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = { ...state.jobs[index], ...action.payload.updates };
        }
      });
  },
});

export const { clearError } = jobsSlice.actions;
export default jobsSlice.reducer;