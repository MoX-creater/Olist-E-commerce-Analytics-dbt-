import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ENDPOINTS } from '../../config';
import ChartWrapper from './ChartWrapper';

const COLORS = ['#4C7A6B', '#6B8E7F', '#8AA193', '#A8B4A8', '#C9A227', '#D4B04A', '#3A5A4D', '#5A6A5A'];

function OrderStatusChart() {
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
      const response = await fetch(ENDPOINTS.orderStatus);
      const json = await response.json();
      
      if (json.success) {
        const formatted = json.data.map(item => ({
          status: item.order_status,
          count: parseInt(item.count),
          percentage: parseFloat(item.percentage)
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-hairline)',
          padding: '0.75rem 1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem'
        }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
            {payload[0].payload.status}
          </p>
          <p style={{ color: 'var(--text-primary)' }}>
            {payload[0].value.toLocaleString()} orders ({payload[0].payload.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  return (
    <ChartWrapper
      title="Order Status Distribution"
      description="Breakdown of orders by current status"
      loading={loading}
      error={error}
      cached={cached}
    >
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => entry.payload.status}
            wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default OrderStatusChart;
