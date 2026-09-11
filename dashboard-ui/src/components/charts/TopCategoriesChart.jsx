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

  const CustomTooltip = ({ active, payload }) => {
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
            {payload[0].payload.category}
          </p>
          <p style={{ color: 'var(--accent-cargo)' }}>
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {payload[0].payload.items.toLocaleString()} items sold
          </p>
        </div>
      );
    }
    return null;
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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
          <XAxis 
            type="number" 
            stroke="var(--text-secondary)" 
            tickFormatter={formatCurrency}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <YAxis 
            type="category" 
            dataKey="category" 
            stroke="var(--text-secondary)"
            width={140}
            tickFormatter={truncateLabel}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="revenue" 
            fill="var(--accent-cargo)" 
            name="Revenue"
            radius={[0, 0, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default TopCategoriesChart;
