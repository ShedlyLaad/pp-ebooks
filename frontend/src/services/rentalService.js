import API from '../api/axios';

export const rentalService = {
  getAllRentals: async () => {
    try {
      const response = await API.get('/rentals');
      return response.data;
    } catch (error) {
      console.error('Error in getAllRentals:', error);
      throw error.response?.data || { message: 'Failed to fetch rentals' };
    }
  },

  getRental: async (id) => {
    try {
      const response = await API.get(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch rental details' };
    }
  },

  rentBook: async (rentalData) => {
    try {
      // Validate required fields
      if (!rentalData?.bookId) {
        throw new Error('Book ID is required');
      }
      if (!rentalData?.dueDate) {
        throw new Error('Due date is required');
      }

      // Validate due date is in the future
      const dueDate = new Date(rentalData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date format');
      }

      if (dueDate <= today) {
        throw new Error('Due date must be in the future');
      }

      const response = await API.post('/rentals', rentalData);
      return response.data;
    } catch (error) {
      console.error('Error in rentBook:', error);
      throw error.response?.data || { message: error.message || 'Failed to rent book' };
    }
  },

  returnBook: async (rentalId) => {
    try {
      if (!rentalId) {
        throw new Error('Rental ID is required');
      }
      const response = await API.put(`/rentals/return/${rentalId}`);
      return response.data;
    } catch (error) {
      console.error('Error in returnBook:', error);
      throw error.response?.data || { message: error.message || 'Failed to return book' };
    }
  },

  getMyRentals: async () => {
    try {
      const response = await API.get('/rentals/my-rentals');
      return response.data;
    } catch (error) {
      console.error('Error in getMyRentals:', error);
      throw error.response?.data || { message: error.message || 'Failed to fetch your rentals' };
    }
  },

  extendRental: async (id, newDueDate) => {
    try {
      if (!id || !newDueDate) {
        throw new Error('Rental ID and new due date are required');
      }

      const dueDate = new Date(newDueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date format');
      }

      if (dueDate <= today) {
        throw new Error('New due date must be in the future');
      }

      const response = await API.put(`/rentals/${id}/extend`, { dueDate: newDueDate });
      return response.data;
    } catch (error) {
      console.error('Error in extendRental:', error);
      throw error.response?.data || { message: error.message || 'Failed to extend rental' };
    }
  }
};
