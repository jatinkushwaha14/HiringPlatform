import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Assessment } from '../../types';
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

export const fetchAllAssessments = createAsyncThunk(
  'assessments/fetchAllAssessments',
  async () => {
    const assessments = await db.assessments.toArray();
    return assessments;
  }
);

export const createAssessment = createAsyncThunk(
  'assessments/createAssessment',
  async (assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const assessment: Assessment = {
      ...assessmentData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.assessments.add(assessment);
    return assessment;
  }
);

export const updateAssessment = createAsyncThunk(
  'assessments/updateAssessment',
  async ({ id, updates }: { id: string; updates: Partial<Assessment> }) => {
    // Get the current assessment first
    const currentAssessment = await db.assessments.get(id);
    if (!currentAssessment) {
      throw new Error('Assessment not found');
    }
    
    // Merge with current data
    const updatedAssessment = { 
      ...currentAssessment, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    await db.assessments.put(updatedAssessment);
    return updatedAssessment;
  }
);

export const deleteAssessment = createAsyncThunk(
  'assessments/deleteAssessment',
  async (id: string) => {
    await db.assessments.delete(id);
    return id;
  }
);

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
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
      })
      .addCase(fetchAllAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAllAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch all assessments';
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.assessments.push(action.payload);
      })
      .addCase(updateAssessment.fulfilled, (state, action) => {
        const index = state.assessments.findIndex(assessment => assessment.id === action.payload.id);
        if (index !== -1) {
          state.assessments[index] = action.payload;
        }
      })
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.assessments = state.assessments.filter(assessment => assessment.id !== action.payload);
      });
  },
});

export const { clearError } = assessmentsSlice.actions;
export default assessmentsSlice.reducer;