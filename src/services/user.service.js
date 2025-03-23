import api from '../config/axios.config';

class UserService {
  async getMyProfile() {
    try {
      const { data } = await api.get('/users/me');
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const { data } = await api.put('/users/me', userData);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfilePicture(formData) {
    try {
      const { data } = await api.put('/users/me/profile-picture', formData);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserPosts(userId) {
    try {
      const { data } = await api.get(`/users/${userId}/posts`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async searchUsers(query) {
    try {
      const { data } = await api.get('/users/search', {
        params: { query }
      });
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService(); 