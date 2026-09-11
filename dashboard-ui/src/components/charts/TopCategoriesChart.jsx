import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ENDPOINTS } from '../../config';
import ChartWrapper from './ChartWrapper';

function TopCategoriesChart() {
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
      const response = await fetch(ENDPOINTS.topCategories);
      const json = await response.json();
      
      if (json.success) {
        const formatted = json.data.map(item => ({
          category: item.product_category_english,
          revenue: parseFloat(item.total_revenue),
          items: parseInt(item.items_sold)
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

  const truncateLabel = (label) => {
    return label.length > 25 ? label.substring(0, 22) + '...' : label;
  };

  return (
    <ChartWrapper
      title="Top Product Categories"
      description="Highest revenue categories with items sold"
      loading={loading}
      error={error}
      cached={cached}
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={data} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" tickFormatter={formatCurrency} />
          <YAxis 
            type="category" 
            dataKey="category" 
            stroke="#9ca3af"
            width={140}
            tickFormatter={truncateLabel}
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
              if (name === 'items') return [value.toLocaleString(), 'Items Sold'];
              return [value, name];
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#667eea" 
            name="Revenue"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default TopCategoriesChart;
