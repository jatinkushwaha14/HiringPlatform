import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import JobsPage from './pages/JobsPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>  
      <div className="App">
        <JobsPage />
      </div>
    </Provider>
  );
}

export default App;