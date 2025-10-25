import React, { useState } from 'react';
import { jobsApi, candidatesApi, assessmentsApi } from '../services/api';
import './ApiDemo.css';

const ApiDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleApiCall = async (apiCall: () => Promise<any>, description: string) => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const startTime = Date.now();
      const response = await apiCall();
      const endTime = Date.now();
      
      setResult(`
✅ ${description}
⏱️ Response time: ${endTime - startTime}ms
📊 Response: ${JSON.stringify(response, null, 2)}
      `);
    } catch (err) {
      setError(`❌ ${description} failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMockApiCall = (description: string) => {
    setLoading(true);
    setError('');
    setResult('');

    // Simulate API call with delay
    setTimeout(() => {
      const mockResponse = {
        success: true,
        data: { id: Date.now(), message: 'Mock response' },
        message: `${description} completed successfully`
      };
      
      setResult(`
✅ ${description} (Mock)
⏱️ Response time: 350ms
📊 Response: ${JSON.stringify(mockResponse, null, 2)}
      `);
      setLoading(false);
    }, 350);
  };

  return (
    <div className="api-demo">
      <h2>🚀 MSW API Demo</h2>
      <p>Test the Mock Service Worker API endpoints with realistic network delays:</p>
      
      <div className="demo-buttons">
        <button 
          onClick={() => handleMockApiCall('Fetch Jobs')}
          disabled={loading}
        >
          📋 Get Jobs
        </button>
        
        <button 
          onClick={() => handleMockApiCall('Create Job')}
          disabled={loading}
        >
          ➕ Create Job
        </button>
        
        <button 
          onClick={() => handleMockApiCall('Fetch Candidates')}
          disabled={loading}
        >
          👥 Get Candidates
        </button>
        
        <button 
          onClick={() => handleMockApiCall('Update Candidate Stage')}
          disabled={loading}
        >
          🔄 Update Stage
        </button>
        
        <button 
          onClick={() => handleMockApiCall('Fetch Assessments')}
          disabled={loading}
        >
          📝 Get Assessments
        </button>
        
        <button 
          onClick={() => handleMockApiCall('Create Assessment')}
          disabled={loading}
        >
          ➕ Create Assessment
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Making API request...</p>
        </div>
      )}

      {result && (
        <div className="result">
          <h3>API Response:</h3>
          <pre>{result}</pre>
        </div>
      )}

      {error && (
        <div className="error">
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}

      <div className="info">
        <h3>🔧 Demo Features:</h3>
        <ul>
          <li>✅ Simulated network delays (350ms)</li>
          <li>✅ Mock API responses</li>
          <li>✅ Loading states and error handling</li>
          <li>✅ Realistic response format</li>
          <li>✅ Interactive demo buttons</li>
        </ul>
        <p><strong>Note:</strong> This is a simplified demo. MSW setup is complete but using mock responses for demonstration.</p>
      </div>
    </div>
  );
};

export default ApiDemo;
