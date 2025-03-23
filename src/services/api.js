import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh-token', { refreshToken });
        const { token } = response.data;

        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Format error response
    const errorResponse = {
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(errorResponse);
  }
);

// Cache configuration
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
};

const isCacheable = (config) => {
  return config.method === 'get' && config.cache !== false;
};

// Auth services
export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
};

// User services with caching
export const userService = {
  getMyProfile: async () => {
    try {
      const response = await api.get('/users/me', { cache: true });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`, { cache: true });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/me', userData);
      // Invalidate user cache after update
      cache.delete(getCacheKey({ method: 'get', url: '/users/me' }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfilePicture: async (file) => {
    try {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
      }

      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.put('/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add upload progress tracking
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can use this to show upload progress
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      // Invalidate user cache after update
      cache.delete(getCacheKey({ method: 'get', url: '/users/me' }));
      return response.data;
    } catch (error) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to upload image. Please try again.');
    }
  },

  getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/posts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchUsers: async (query) => {
    try {
      const response = await api.get('/users/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Post services with caching
export const postService = {
  getAllPosts: async (params = {}) => {
    try {
      const response = await api.get('/posts', { 
        params,
        cache: true,
        cacheTimeout: 2 * 60 * 1000 // 2 minutes for feed
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPost: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`, { cache: true });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPost: async (formData) => {
    try {
      // Validate content
      const content = formData.get('content');
      if (!content || !content.trim()) {
        throw new Error('Post content is required');
      }

      // Validate images
      const images = formData.getAll('images');
      if (!images || images.length === 0) {
        throw new Error('At least one image is required');
      }

      // Validate each image
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      images.forEach((image, index) => {
        if (!validTypes.includes(image.type)) {
          throw new Error(`Image ${index + 1} has invalid type. Please upload JPEG, PNG, or GIF images only.`);
        }
        if (image.size > maxSize) {
          throw new Error(`Image ${index + 1} is too large. Maximum size is 10MB.`);
        }
      });

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      // Invalidate posts cache after creation
      cache.delete(getCacheKey({ method: 'get', url: '/posts' }));
      return response.data;
    } catch (error) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create post. Please try again.');
    }
  },

  updatePost: async (postId, formData) => {
    try {
      // Validate content
      const content = formData.get('content');
      if (!content || !content.trim()) {
        throw new Error('Post content is required');
      }

      // Validate images
      const images = formData.getAll('images');
      if (!images || images.length === 0) {
        throw new Error('At least one image is required');
      }

      // Validate each image
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      images.forEach((image, index) => {
        if (!validTypes.includes(image.type)) {
          throw new Error(`Image ${index + 1} has invalid type. Please upload JPEG, PNG, or GIF images only.`);
        }
        if (image.size > maxSize) {
          throw new Error(`Image ${index + 1} is too large. Maximum size is 10MB.`);
        }
      });

      const response = await api.put(`/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      // Invalidate specific post and posts list cache
      cache.delete(getCacheKey({ method: 'get', url: `/posts/${postId}` }));
      cache.delete(getCacheKey({ method: 'get', url: '/posts' }));
      return response.data;
    } catch (error) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update post. Please try again.');
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      // Invalidate caches
      cache.delete(getCacheKey({ method: 'get', url: `/posts/${postId}` }));
      cache.delete(getCacheKey({ method: 'get', url: '/posts' }));
    } catch (error) {
      throw error;
    }
  },

  toggleLike: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      // Invalidate post cache
      cache.delete(getCacheKey({ method: 'get', url: `/posts/${postId}` }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addComment: async (postId, text) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { text });
      // Invalidate comments cache
      cache.delete(getCacheKey({ method: 'get', url: `/posts/${postId}/comments` }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getComments: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`, { cache: true });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      // Invalidate comments cache
      cache.delete(getCacheKey({ method: 'get', url: `/posts/${postId}/comments` }));
    } catch (error) {
      throw error;
    }
  },

  toggleCommentLike: async (postId, commentId) => {
    try {
      const response = await api.post(`/posts/${postId}/comments/${commentId}/like`);
      // Invalidate comments cache
      cache.delete(getCacheKey({ method: 'get', url: `/posts/${postId}/comments` }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 