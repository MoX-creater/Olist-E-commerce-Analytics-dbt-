import React from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="masthead">
          <h1>Olist Trade Ledger</h1>
          <p className="subtitle">Brazilian Marketplace Analytics – Orders, Freight, Delivery & Revenue</p>
        </div>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;
