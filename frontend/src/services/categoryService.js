import api from '../api/axios';

export const categoryService = {
  getCategories: async () => {
    try {
      const response = await api.get('/books/categories');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error.response?.data || error;
    }
  },

  createCategory: async (name) => {
    try {
      const response = await api.post('/books/categories', { name });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error.response?.data || error;
    }
  }
};