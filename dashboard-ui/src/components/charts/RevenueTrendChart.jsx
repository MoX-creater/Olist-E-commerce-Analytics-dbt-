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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-hairline)',
          padding: '0.75rem 1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem'
        }}>
          <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            {formatMonth(label)}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, marginBottom: '0.25rem' }}>
              {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--text-secondary)" 
            tickFormatter={formatMonth}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="var(--text-secondary)" 
            tickFormatter={formatCurrency}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--accent-cargo)" 
            strokeWidth={1.5}
            dot={{ fill: 'var(--accent-cargo)', r: 3 }}
            activeDot={{ r: 5 }}
            name="Revenue"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            stroke="var(--text-secondary)" 
            strokeWidth={1.5}
            dot={{ fill: 'var(--text-secondary)', r: 2 }}
            name="Orders"
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default RevenueTrendChart;
