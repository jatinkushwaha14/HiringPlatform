import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState<'jobs' | 'candidates'>('jobs');
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
        </nav>
        
        {currentPage === 'jobs' && <JobsPage />}
        {currentPage === 'candidates' && <CandidatesPage />}
      </div>
    </Provider>
  );
}

export default App;