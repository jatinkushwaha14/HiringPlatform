import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Candidate } from '../../types';
import { db } from '../../services/database';

interface CandidatesState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
}

const initialState: CandidatesState = {
  candidates: [],
  loading: false,
  error: null,
};

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates',
  async (params: { search?: string; stage?: string; page?: number } = {}) => {
    let candidates = await db.candidates.toArray();
    
    if (params.search) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        candidate.email.toLowerCase().includes(params.search!.toLowerCase())
      );
    }
    
    if (params.stage) {
      candidates = candidates.filter(candidate => candidate.stage === params.stage);
    }
    
    return candidates;
  }
);

export const updateCandidateStage = createAsyncThunk(
    'candidates/updateCandidateStage',
    async ({ id, stage }: { id: string; stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected' }) => {
      await db.candidates.update(id, { stage, updatedAt: new Date().toISOString() });
      return { id, stage };
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
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch candidates';
      })
      .addCase(updateCandidateStage.fulfilled, (state, action) => {
        const candidate = state.candidates.find(c => c.id === action.payload.id);
        if (candidate) {
          candidate.stage = action.payload.stage as any;
          candidate.updatedAt = new Date().toISOString();
        }
      });
  },
});


export const { clearError } = candidatesSlice.actions;
export default candidatesSlice.reducer;