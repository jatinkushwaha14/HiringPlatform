import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import TypeTest from './components/TypeTest';
import JobsTest from './components/JobsTest';
import './App.css';

function App() {
  return (
    <Provider store={store}>  
      <div className="App">
        <h1>Hello World!</h1>
        <p>Basic React app is working!</p>
        <TypeTest />
        <JobsTest />
      </div>
    </Provider>
  );
}

export default App;