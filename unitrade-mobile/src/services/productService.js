import api, { handleApiError, createFormData } from './api';
import { API_ENDPOINTS } from '../constants/config';

export const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create product
  createProduct: async (productData, images = []) => {
    try {
      console.log('=== PRODUCT SERVICE DEBUG ===');
      console.log('Product data received:', productData);
      console.log('Images received:', images.length, 'images');
      console.log('Images details:', images.map((img, i) => ({
        index: i,
        uri: img.uri,
        type: img.type,
        fileName: img.fileName,
        fileSize: img.fileSize
      })));
      
      const formData = createFormData(productData, images);
      console.log('FormData created, posting to:', API_ENDPOINTS.PRODUCTS);
      
      const response = await api.post(API_ENDPOINTS.PRODUCTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout for file uploads
      });
      
      console.log('Product creation successful:', response.data);
      console.log('=============================');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Product creation failed:', error);
      console.log('=============================');
      return handleApiError(error);
    }
  },

  // Update product
  updateProduct: async (id, productData, images = [], deleteImageIds = []) => {
    try {
      const data = {
        ...productData,
        delete_image_ids: deleteImageIds.join(','),
      };
      const formData = createFormData(data, images);
      const response = await api.put(API_ENDPOINTS.PRODUCT_DETAIL(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.PRODUCT_DETAIL(id));
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get product ratings
  getRatings: async (productId) => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCT_RATINGS(productId));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Rate product
  rateProduct: async (productId, ratingData) => {
    try {
      const response = await api.post(API_ENDPOINTS.PRODUCT_RATINGS(productId), ratingData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    try {
      const params = {
        search: query,
        ...filters,
      };
      const response = await api.get(API_ENDPOINTS.PRODUCTS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
