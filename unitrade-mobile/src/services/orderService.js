import api, { handleApiError } from './api';
import { API_ENDPOINTS } from '../constants/config';

export const orderService = {
  // Get all orders
  getOrders: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get single order
  getOrder: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_DETAIL(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create order
  createOrder: async (orderData) => {
    try {
      const response = await api.post(API_ENDPOINTS.ORDERS, orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Initialize Paystack payment
  initializePayment: async (amount, email, orderId) => {
    try {
      const response = await api.post(API_ENDPOINTS.PAYSTACK_INIT, {
        amount,
        email,
        order_id: orderId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Verify payment
  verifyPayment: async (reference) => {
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_PAYMENT, {
        reference,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
