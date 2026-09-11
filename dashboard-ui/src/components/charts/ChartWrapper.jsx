import React from 'react';

function ChartWrapper({ title, description, loading, error, cached, children }) {
  const getTimestamp = () => {
    const now = new Date();
    return `synced ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div>
        <div className="chart-header">
          <div className="chart-title-group">
            <h2 className="chart-title">{title}</h2>
            {description && <p className="chart-description">{description}</p>}
          </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p className="loading-text">Loading</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="chart-header">
          <div className="chart-title-group">
            <h2 className="chart-title">{title}</h2>
            {description && <p className="chart-description">{description}</p>}
          </div>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <p className="error-message">Data Unavailable</p>
          <p className="error-details">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="chart-header">
        <div className="chart-title-group">
          <h2 className="chart-title">{title}</h2>
          {description && <p className="chart-description">{description}</p>}
        </div>
        <span className="chart-timestamp">{getTimestamp()}</span>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
}

export default ChartWrapper;
