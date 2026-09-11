import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ENDPOINTS } from '../../config';
import ChartWrapper from './ChartWrapper';

function DeliveryPerformanceChart() {
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
      const response = await fetch(ENDPOINTS.delivery);
      const json = await response.json();
      
      if (json.success) {
        // Take top 10 states by order count
        const formatted = json.data.slice(0, 10).map(item => ({
          state: item.seller_state,
          avgDeliveryDays: parseFloat(item.avg_delivery_days),
          lateDeliveryPct: parseFloat(item.pct_late_deliveries),
          orders: parseInt(item.total_orders)
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
            {payload[0].payload.state}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, marginBottom: '0.25rem' }}>
              {entry.name === 'Avg Delivery Days' && `${entry.value.toFixed(1)} days`}
              {entry.name === 'Late Delivery %' && `${entry.value.toFixed(1)}% late`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartWrapper
      title="Delivery Performance by State"
      description="Average delivery time and late delivery percentage (top 10 states)"
      loading={loading}
      error={error}
      cached={cached}
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
          <XAxis 
            dataKey="state" 
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
          <YAxis 
            yAxisId="left" 
            stroke="var(--text-secondary)"
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
          <Bar 
            yAxisId="left"
            dataKey="avgDeliveryDays" 
            fill="var(--accent-cargo)" 
            name="Avg Delivery Days"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            yAxisId="right"
            dataKey="lateDeliveryPct" 
            fill="var(--accent-gold)" 
            name="Late Delivery %"
            radius={[0, 0, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default DeliveryPerformanceChart;
