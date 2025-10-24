import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import TypeTest from './components/TypeTest';
import JobsList from './components/Jobs/JobsList';
import './App.css';

function App() {
  return (
    <Provider store={store}>  
      <div className="App">
        <h1>TalentFlow - Hiring Platform</h1>
        <TypeTest />
        <JobsList />
      </div>
    </Provider>
  );
}

export default App;