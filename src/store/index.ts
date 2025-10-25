import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './slices/jobsSlice';
import candidatesReducer from './slices/candidatesSlice';
import assessmentsReducer from './slices/assessmentsSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    candidates: candidatesReducer,
    assessments: assessmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;