import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, APP_CONFIG } from '../constants/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(
          APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY
        );

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(
            `${API_BASE_URL}/users/token/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;

          // Save new access token
          await AsyncStorage.setItem(APP_CONFIG.TOKEN_STORAGE_KEY, access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await AsyncStorage.multiRemove([
          APP_CONFIG.TOKEN_STORAGE_KEY,
          APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
          APP_CONFIG.USER_STORAGE_KEY,
        ]);
        // You can emit an event here to trigger navigation to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to convert file to base64
const fileToBase64 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.log('Error converting file to base64:', error);
    return null;
  }
};

// Helper function to handle multipart/form-data
export const createFormData = (data, files = []) => {
  console.log('=== CREATING FORMDATA ===');
  console.log('Data fields:', data);
  console.log('Files to upload:', files.length);
  
  const formData = new FormData();

  // Add regular fields
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      console.log(`Adding field: ${key} = ${data[key]}`);
      formData.append(key, data[key]);
    }
  });

  // Add files with proper format for React Native
  files.forEach((file, index) => {
    console.log(`Adding image ${index}:`, {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || `image_${index}.jpg`,
      size: file.fileSize
    });
    
    formData.append('images', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || `image_${index}.jpg`,
    });
  });

  console.log('FormData created successfully');
  console.log('========================');
  return formData;
};

// Alternative: Create JSON payload with base64 images
export const createJsonWithImages = async (data, files = []) => {
  console.log('=== CREATING JSON WITH BASE64 IMAGES ===');
  console.log('Data fields:', data);
  console.log('Files to upload:', files.length);
  
  const payload = { ...data };
  const images = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`Converting image ${i} to base64...`);
    
    try {
      const base64 = await fileToBase64(file.uri);
      if (base64) {
        images.push({
          name: file.fileName || `image_${i}.jpg`,
          type: file.type || 'image/jpeg',
          data: base64,
          size: file.fileSize
        });
        console.log(`✅ Image ${i} converted successfully (${base64.length} characters)`);
      }
    } catch (error) {
      console.log(`❌ Failed to convert image ${i}:`, error);
    }
  }
  
  payload.images_base64 = images;
  console.log('JSON payload created with', images.length, 'images');
  console.log('==========================================');
  return payload;
};

// API error handler
export const handleApiError = (error) => {
  console.log('=== API ERROR DEBUG ===');
  console.log('Error object:', error);
  console.log('Error response:', error.response);
  console.log('Error response data:', error.response?.data);
  console.log('Error status:', error.response?.status);
  console.log('=====================');

  if (error.response) {
    // Server responded with error
    let message = 'An error occurred';
    
    // Try different ways to get the error message
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.detail) {
        message = error.response.data.detail;
      } else if (error.response.data.error) {
        message = error.response.data.error;
      } else {
        // If it's an object with validation errors, format them
        message = JSON.stringify(error.response.data);
      }
    }
    
    return {
      success: false,
      error: message, // Changed from 'message' to 'error' to match usage
      message, // Keep both for compatibility
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      error: 'No response from server. Please check your connection.',
      message: 'No response from server. Please check your connection.',
      status: null,
    };
  } else {
    // Something else happened
    const errorMsg = error.message || 'An unexpected error occurred';
    return {
      success: false,
      error: errorMsg,
      message: errorMsg,
      status: null,
    };
  }
};

export default api;
