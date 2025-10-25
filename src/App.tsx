import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ApiDemo from './components/ApiDemo';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState<'jobs' | 'candidates' | 'assessments' | 'api-demo'>('jobs');
  return (
    <Provider store={store}>
      <div className="App">
        <nav style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid #e1e5e9',
          backgroundColor: 'white',
          display: 'flex',
          gap: '16px'
        }}>
          <button
            onClick={() => setCurrentPage('jobs')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: currentPage === 'jobs' ? '#007bff' : 'transparent',
              color: currentPage === 'jobs' ? 'white' : '#495057',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Jobs
          </button>
          <button
            onClick={() => setCurrentPage('candidates')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: currentPage === 'candidates' ? '#007bff' : 'transparent',
              color: currentPage === 'candidates' ? 'white' : '#495057',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Candidates
          </button>
          <button
            onClick={() => setCurrentPage('assessments')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: currentPage === 'assessments' ? '#007bff' : 'transparent',
              color: currentPage === 'assessments' ? 'white' : '#495057',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Assessments
          </button>
          <button
            onClick={() => setCurrentPage('api-demo')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: currentPage === 'api-demo' ? '#007bff' : 'transparent',
              color: currentPage === 'api-demo' ? 'white' : '#495057',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🚀 API Demo
          </button>
        </nav>
        
        {currentPage === 'jobs' && <JobsPage />}
        {currentPage === 'candidates' && <CandidatesPage />}
        {currentPage === 'assessments' && <AssessmentsPage />}
        {currentPage === 'api-demo' && <ApiDemo />}
      </div>
    </Provider>
  );
}

export default App;