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
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="category" 
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={100}
            tickFormatter={truncateLabel}
          />
          <YAxis stroke="#9ca3af" domain={[0, 5]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
            formatter={(value, name) => {
              if (name === 'onTime') return [value.toFixed(2), 'On-Time Delivery'];
              if (name === 'late') return [value.toFixed(2), 'Late Delivery'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar 
            dataKey="onTime" 
            fill="#10b981" 
            name="On-Time Delivery"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="late" 
            fill="#f59e0b" 
            name="Late Delivery"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default ReviewScoreChart;
