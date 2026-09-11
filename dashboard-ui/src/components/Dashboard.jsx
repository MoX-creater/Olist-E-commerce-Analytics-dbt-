import React from 'react';
import RevenueTrendChart from './charts/RevenueTrendChart';
import DeliveryPerformanceChart from './charts/DeliveryPerformanceChart';
import ReviewScoreChart from './charts/ReviewScoreChart';
import TopCategoriesChart from './charts/TopCategoriesChart';
import OrderStatusChart from './charts/OrderStatusChart';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="chart-card large">
          <RevenueTrendChart />
        </div>
        
        <div className="chart-card">
          <OrderStatusChart />
        </div>
        
        <div className="chart-card large">
          <TopCategoriesChart />
        </div>
        
        <div className="chart-card large">
          <DeliveryPerformanceChart />
        </div>
        
        <div className="chart-card large">
          <ReviewScoreChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
