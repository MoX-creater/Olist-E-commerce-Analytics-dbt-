import React from 'react';

function ChartWrapper({ title, description, loading, error, cached, children }) {
  if (loading) {
    return (
      <div>
        <div className="chart-header">
          <h2 className="chart-title">{title}</h2>
          {description && <p className="chart-description">{description}</p>}
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="chart-header">
          <h2 className="chart-title">{title}</h2>
          {description && <p className="chart-description">{description}</p>}
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p className="error-message">Failed to load data</p>
          <p className="error-details">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="chart-header">
        <h2 className="chart-title">
          {title}
          {cached && <span className="cache-badge">Cached</span>}
        </h2>
        {description && <p className="chart-description">{description}</p>}
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
}

export default ChartWrapper;
