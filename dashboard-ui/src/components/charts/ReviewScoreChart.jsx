import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ENDPOINTS } from '../../config';
import ChartWrapper from './ChartWrapper';

function ReviewScoreChart() {
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
      const response = await fetch(ENDPOINTS.reviews);
      const json = await response.json();
      
      if (json.success) {
        // Data is now aggregated by category with onTime_score and late_score
        const formatted = json.data.map(item => ({
          category: item.product_category_english,
          onTime: item.ontime_score ? parseFloat(item.ontime_score) : 0,
          late: item.late_score ? parseFloat(item.late_score) : 0,
          totalReviews: parseInt(item.total_reviews)
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

  const truncateLabel = (label) => {
    return label.length > 20 ? label.substring(0, 17) + '...' : label;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-hairline)',
          padding: '0.75rem 1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          maxWidth: '250px'
        }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: '500', wordWrap: 'break-word' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, marginBottom: '0.25rem' }}>
              {entry.name}: {entry.value.toFixed(2)} ⭐
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartWrapper
      title="Review Scores by Delivery Status"
      description="Average review scores: on-time vs late deliveries (top 10 categories)"
      loading={loading}
      error={error}
      cached={cached}
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
          <XAxis 
            dataKey="category" 
            stroke="var(--text-secondary)"
            angle={-45}
            textAnchor="end"
            height={100}
            tickFormatter={truncateLabel}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            domain={[0, 5]}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }} />
          <Bar 
            dataKey="onTime" 
            fill="var(--accent-cargo)" 
            name="On-Time Delivery"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="late" 
            fill="var(--accent-gold)" 
            name="Late Delivery"
            radius={[0, 0, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default ReviewScoreChart;
