import API from '../api/axios';

export const rentalService = {  getAllRentals: async () => {
    try {
      const response = await API.get('/rentals');
      console.log('Rentals response:', response); // For debugging
      return response.data || { data: [] };
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
        throw new Error('Due Date is required');
      }

      // Validate due date is in the future
      const dueDate = new Date(rentalData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid date format');
      }

      if (dueDate <= today) {
        throw new Error('Due date must be at least one day in the future');
      }

      const response = await API.post('/rentals', {
        bookId: rentalData.bookId,
        dueDate: dueDate.toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Rental error:', error);
      throw error.response?.data || error;
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
      console.error('Return error:', error);
      throw error.response?.data || error;
    }
  },

  getMyRentals: async () => {
    try {
      const response = await API.get('/rentals/my-rentals');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch your rentals' };
    }
  },

  extendRental: async (id, newDueDate) => {
    try {
      if (!id || !newDueDate) {
        throw new Error('Rental ID and new due date are required');
      }

      const response = await API.put(`/rentals/${id}/extend`, {
        dueDate: new Date(newDueDate).toISOString()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to extend rental' };
    }
  }
};
