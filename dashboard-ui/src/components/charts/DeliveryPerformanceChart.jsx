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
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="state" stroke="#9ca3af" />
          <YAxis yAxisId="left" stroke="#9ca3af" />
          <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
            formatter={(value, name) => {
              if (name === 'avgDeliveryDays') return [value.toFixed(1) + ' days', 'Avg Delivery Days'];
              if (name === 'lateDeliveryPct') return [value.toFixed(1) + '%', 'Late Delivery %'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="avgDeliveryDays" 
            fill="#667eea" 
            name="Avg Delivery Days"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            yAxisId="right"
            dataKey="lateDeliveryPct" 
            fill="#ef4444" 
            name="Late Delivery %"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default DeliveryPerformanceChart;
