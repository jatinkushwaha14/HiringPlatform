import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './slices/jobsSlice';
import candidatesReducer from './slices/candidatesSlice';
import assessmentsReducer from './slices/assessmentsSlice';
import assessmentResponsesReducer from './slices/assessmentResponsesSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    candidates: candidatesReducer,
    assessments: assessmentsReducer,
    assessmentResponses: assessmentResponsesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;