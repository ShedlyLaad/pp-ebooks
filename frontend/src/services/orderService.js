import API from '../api/axios';

export const orderService = {    getAllOrders: async () => {
        try {
            const response = await API.get('/orders');
            console.log('Orders response:', response); // For debugging
            return response.data || { data: [] };
        } catch (error) {
            console.error('Error in getAllOrders:', error);
            throw error.response?.data || { message: error.message || 'Failed to fetch orders' };
        }
    },

    getMyOrders: async () => {
        try {
            const response = await API.get('/orders/my-orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getOrder: async (id) => {
        try {
            const response = await API.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createOrder: async (orderData) => {
        try {
            const response = await API.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateOrderStatus: async (id, status) => {
        try {
            const response = await API.put(`/orders/${id}`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
