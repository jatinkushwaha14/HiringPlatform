import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Candidate } from '../../types';

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
  async () => {
    // Return empty array for now
    return [];
  }
);

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {},
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
      });
  },
});

export default candidatesSlice.reducer;