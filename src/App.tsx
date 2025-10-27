import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { store } from './store';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import AssessmentsPage from './pages/AssessmentsPage';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/jobs', label: 'Jobs' },
    { path: '/candidates', label: 'Candidates' },
    { path: '/assessments', label: 'Assessments' }
  ];

  return (
    <nav style={{ 
      padding: '16px 24px', 
      borderBottom: '1px solid #e1e5e9',
      backgroundColor: 'white',
      display: 'flex',
      gap: '16px'
    }}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: location.pathname.startsWith(item.path) ? '#007bff' : 'transparent',
            color: location.pathname.startsWith(item.path) ? 'white' : '#495057',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<JobsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:candidateId" element={<CandidateDetailPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;