import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Job } from '../../types/index.ts';
import { jobsApi } from '../../services/api';

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: JobsState = {
  jobs: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: { search?: string; status?: string; page?: number; pageSize?: number; sort?: string; tags?: string[] } = {}) => {
    const res = await jobsApi.list(params);
    return res.data; // { items, total, page, pageSize }
  }
);

export const createJob = createAsyncThunk<Job, Omit<Job, 'id' | 'createdAt' | 'updatedAt'>, { rejectValue: string }>(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const res = await jobsApi.create(jobData);
      return res.data as Job;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create job';
      return rejectWithValue(message);
    }
  }
);
export const updateJob = createAsyncThunk<Job, { id: string; updates: Partial<Job> }, { rejectValue: string }>(
  'jobs/updateJob',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await jobsApi.update(id, updates);
      return res.data as Job;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update job';
      return rejectWithValue(message);
    }
  }
);

export const reorderJob = createAsyncThunk<Job[], { id: string; fromOrder: number; toOrder: number }, { rejectValue: string }>(
  'jobs/reorderJob',
  async ({ id, fromOrder, toOrder }, { rejectWithValue }) => {
    try {
      const res = await jobsApi.reorder(id, { fromOrder, toOrder });
      return res.data as Job[];
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to reorder jobs';
      return rejectWithValue(message);
    }
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
        state.jobs = action.payload.items as Job[];
        state.total = action.payload.total as number;
        state.page = action.payload.page as number;
        state.pageSize = action.payload.pageSize as number;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload as Job);
        state.total += 1;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job.id === (action.payload as Job).id);
        if (index !== -1) {
          state.jobs[index] = action.payload as Job;
        }
      })
      .addCase(reorderJob.fulfilled, (state, action) => {
        // Replace current page slice orders if present in payload
        const updated = action.payload as Job[];
        // Merge by id
        const byId = new Map(updated.map(j => [j.id, j]));
        state.jobs = state.jobs.map(j => byId.get(j.id) ?? j);
      });
  },
});

export const { clearError } = jobsSlice.actions;
export default jobsSlice.reducer;