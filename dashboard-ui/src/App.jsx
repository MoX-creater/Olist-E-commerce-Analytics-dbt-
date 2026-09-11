import React from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 Olist Analytics Dashboard</h1>
        <p className="subtitle">E-commerce insights powered by dbt</p>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;
