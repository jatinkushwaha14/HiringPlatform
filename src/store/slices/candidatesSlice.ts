import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Candidate } from '../../types';
import { candidatesApi } from '../../services/api';

interface CandidatesState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: CandidatesState = {
  candidates: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 25,
};

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates',
  async (params: { search?: string; stage?: string; page?: number; pageSize?: number } = {}) => {
    const res = await candidatesApi.list(params);
    return res.data; // { items, total, page, pageSize }
  }
);

export const updateCandidateStage = createAsyncThunk(
  'candidates/updateCandidateStage',
  async ({ id, stage }: { id: string; stage: Candidate['stage'] }) => {
    const res = await candidatesApi.updateStage(id, stage);
    return res.data as { id: string; stage: Candidate['stage'] };
  }
);

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    clearError: (state) => {
        state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload.items as Candidate[];
        state.total = action.payload.total as number;
        state.page = action.payload.page as number;
        state.pageSize = action.payload.pageSize as number;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch candidates';
      })
      .addCase(updateCandidateStage.fulfilled, (state, action) => {
        const candidate = state.candidates.find(c => c.id === action.payload.id);
        if (candidate) {
          candidate.stage = action.payload.stage;
          candidate.updatedAt = new Date().toISOString();
        }
      });
  },
});


export const { clearError } = candidatesSlice.actions;
export default candidatesSlice.reducer;