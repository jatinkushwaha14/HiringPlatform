import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Assessment } from '../../types';
import { db } from '../../services/database';

interface AssessmentsState {
  assessments: Assessment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssessmentsState = {
  assessments: [],
  loading: false,
  error: null,
};

export const fetchAssessments = createAsyncThunk(
  'assessments/fetchAssessments',
  async (jobId: string) => {
    const assessments = await db.assessments.where('jobId').equals(jobId).toArray();
    return assessments;
  }
);

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch assessments';
      });
  },
});

export default assessmentsSlice.reducer;