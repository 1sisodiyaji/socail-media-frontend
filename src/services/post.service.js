import api from '../config/axios.config';

const token = localStorage.getItem('token'); 
class PostService {
  async getAllPosts({ page = 1, limit = 10 } = {}) {
    try {
      const { data } = await api.get('/posts', {
        params: { page, limit }
      });
      return {
        posts: data.posts || [],
        hasMore: data.hasMore || false
      };
    } catch (error) {
      throw error;
    }
  }

  async getPost(postId) {
    try {
      const { data } = await api.get(`/posts/${postId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createPost(formData) {
    try {
      console.log(formData);
      const { data } = await api.post('/posts', formData);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updatePost(postId, formData) {
    try {
      const { data } = await api.put(`/posts/${postId}`, formData);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      await api.delete(`/posts/${postId}`);
    } catch (error) {
      throw error;
    }
  }

  async toggleLike(postId) {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Comment related methods
  async getComments(postId) {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async addComment(postId, { text }) {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(postId, commentId) {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
    } catch (error) {
      throw error;
    }
  }

  async toggleCommentLike(postId, commentId) {
    try {
      const { data } = await api.post(`/posts/${postId}/comments/${commentId}/like`);
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PostService(); 