import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ENDPOINTS } from '../../config';
import ChartWrapper from './ChartWrapper';

function RevenueTrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.revenue);
      const json = await response.json();
      
      if (json.success) {
        // Format data for chart
        const formatted = json.data.map(item => ({
          month: item.month,
          revenue: parseFloat(item.total_revenue),
          orders: parseInt(item.order_count),
          avgValue: parseFloat(item.avg_order_value)
        }));
        
        setData(formatted);
        setCached(json.cached);
        setError(null);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  };

  const formatMonth = (value) => {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <ChartWrapper
      title="Monthly Revenue Trend"
      description="Total revenue and order volume over time"
      loading={loading}
      error={error}
      cached={cached}
    >
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af" 
            tickFormatter={formatMonth}
          />
          <YAxis 
            yAxisId="left"
            stroke="#9ca3af" 
            tickFormatter={formatCurrency}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#9ca3af"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
            formatter={(value, name) => {
              if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
              if (name === 'orders') return [value, 'Orders'];
              return [value, name];
            }}
            labelFormatter={formatMonth}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke="#667eea" 
            strokeWidth={3}
            dot={{ fill: '#667eea', r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default RevenueTrendChart;
