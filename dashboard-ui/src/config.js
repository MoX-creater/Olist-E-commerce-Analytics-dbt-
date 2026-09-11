export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const ENDPOINTS = {
  revenue: `${API_BASE_URL}/api/revenue/monthly`,
  delivery: `${API_BASE_URL}/api/delivery/performance`,
  reviews: `${API_BASE_URL}/api/reviews/analysis`,
  topCategories: `${API_BASE_URL}/api/products/top-categories`,
  orderStatus: `${API_BASE_URL}/api/orders/status-breakdown`
};
