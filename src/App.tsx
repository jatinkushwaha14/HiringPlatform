import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import TypeTest from './components/TypeTest';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Hello World!</h1>
      <p>Basic React app is working!</p>
      <TypeTest />
    </div>
  );
}

export default App;