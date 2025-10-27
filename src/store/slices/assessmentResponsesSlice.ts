import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AssessmentResponse } from '../../types';
import { db } from '../../services/database';

interface AssessmentResponsesState {
  responses: AssessmentResponse[];
  loading: boolean;
  error: string | null;
  currentResponse: AssessmentResponse | null;
}

const initialState: AssessmentResponsesState = {
  responses: [],
  loading: false,
  error: null,
  currentResponse: null,
};

// Fetch all responses for a specific assessment
export const fetchAssessmentResponses = createAsyncThunk(
  'assessmentResponses/fetchAssessmentResponses',
  async (assessmentId: string) => {
    const responses = await db.assessmentResponses
      .where('assessmentId')
      .equals(assessmentId)
      .toArray();
    return responses;
  }
);

// Fetch responses for a specific candidate
export const fetchCandidateResponses = createAsyncThunk(
  'assessmentResponses/fetchCandidateResponses',
  async (candidateId: string) => {
    const responses = await db.assessmentResponses
      .where('candidateId')
      .equals(candidateId)
      .toArray();
    return responses;
  }
);

// Fetch a specific response
export const fetchAssessmentResponse = createAsyncThunk(
  'assessmentResponses/fetchAssessmentResponse',
  async ({ assessmentId, candidateId }: { assessmentId: string; candidateId: string }) => {
    const response = await db.assessmentResponses
      .where(['assessmentId', 'candidateId'])
      .equals([assessmentId, candidateId])
      .first();
    return response;
  }
);

// Save or update an assessment response
export const saveAssessmentResponse = createAsyncThunk(
  'assessmentResponses/saveAssessmentResponse',
  async ({ 
    assessmentId, 
    candidateId, 
    responses, 
    isDraft = false 
  }: { 
    assessmentId: string; 
    candidateId: string; 
    responses: Record<string, any>; 
    isDraft?: boolean;
  }) => {
    // Check if response already exists
    const existingResponse = await db.assessmentResponses
      .where(['assessmentId', 'candidateId'])
      .equals([assessmentId, candidateId])
      .first();

    const responseData: AssessmentResponse = {
      id: existingResponse?.id || crypto.randomUUID(),
      assessmentId,
      candidateId,
      responses,
      submittedAt: isDraft ? existingResponse?.submittedAt || '' : new Date().toISOString(),
    };

    await db.assessmentResponses.put(responseData);
    return responseData;
  }
);

// Submit an assessment response (mark as completed)
export const submitAssessmentResponse = createAsyncThunk(
  'assessmentResponses/submitAssessmentResponse',
  async ({ 
    assessmentId, 
    candidateId, 
    responses 
  }: { 
    assessmentId: string; 
    candidateId: string; 
    responses: Record<string, any>; 
  }) => {
    const responseData: AssessmentResponse = {
      id: crypto.randomUUID(),
      assessmentId,
      candidateId,
      responses,
      submittedAt: new Date().toISOString(),
    };

    await db.assessmentResponses.put(responseData);
    return responseData;
  }
);

// Delete an assessment response
export const deleteAssessmentResponse = createAsyncThunk(
  'assessmentResponses/deleteAssessmentResponse',
  async (responseId: string) => {
    await db.assessmentResponses.delete(responseId);
    return responseId;
  }
);

const assessmentResponsesSlice = createSlice({
  name: 'assessmentResponses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentResponse: (state, action) => {
      state.currentResponse = action.payload;
    },
    clearCurrentResponse: (state) => {
      state.currentResponse = null;
    },
    updateCurrentResponse: (state, action) => {
      if (state.currentResponse) {
        state.currentResponse.responses = {
          ...state.currentResponse.responses,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assessment Responses
      .addCase(fetchAssessmentResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentResponses.fulfilled, (state, action) => {
        state.loading = false;
        state.responses = action.payload;
      })
      .addCase(fetchAssessmentResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch assessment responses';
      })
      
      // Fetch Candidate Responses
      .addCase(fetchCandidateResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateResponses.fulfilled, (state, action) => {
        state.loading = false;
        state.responses = action.payload;
      })
      .addCase(fetchCandidateResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch candidate responses';
      })
      
      // Fetch Single Response
      .addCase(fetchAssessmentResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload || null;
      })
      .addCase(fetchAssessmentResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch assessment response';
      })
      
      // Save Response
      .addCase(saveAssessmentResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAssessmentResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload;
        // Update or add to responses array
        const existingIndex = state.responses.findIndex(r => r.id === action.payload.id);
        if (existingIndex !== -1) {
          state.responses[existingIndex] = action.payload;
        } else {
          state.responses.push(action.payload);
        }
      })
      .addCase(saveAssessmentResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save assessment response';
      })
      
      // Submit Response
      .addCase(submitAssessmentResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAssessmentResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponse = action.payload;
        // Update or add to responses array
        const existingIndex = state.responses.findIndex(r => r.id === action.payload.id);
        if (existingIndex !== -1) {
          state.responses[existingIndex] = action.payload;
        } else {
          state.responses.push(action.payload);
        }
      })
      .addCase(submitAssessmentResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit assessment response';
      })
      
      // Delete Response
      .addCase(deleteAssessmentResponse.fulfilled, (state, action) => {
        state.responses = state.responses.filter(response => response.id !== action.payload);
        if (state.currentResponse?.id === action.payload) {
          state.currentResponse = null;
        }
      });
  },
});

export const { 
  clearError, 
  setCurrentResponse, 
  clearCurrentResponse, 
  updateCurrentResponse 
} = assessmentResponsesSlice.actions;

export default assessmentResponsesSlice.reducer;
