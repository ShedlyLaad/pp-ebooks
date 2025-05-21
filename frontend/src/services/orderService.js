import API from '../api/axios';

export const orderService = {
    getAllOrders: async () => {
        try {
            const response = await API.get('/orders');
            return response.data;
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
            throw error.response?.data || { message: error.message || 'Failed to fetch your orders' };
        }
    },

    getOrder: async (id) => {
        try {
            if (!id) {
                throw new Error('Order ID is required');
            }
            const response = await API.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error.response?.data || { message: error.message || 'Failed to fetch order details' };
        }
    },

    createOrder: async (orderData) => {
        try {
            if (!orderData?.orderItems?.length) {
                throw new Error('Order items are required');
            }
            const response = await API.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error.response?.data || { message: error.message || 'Failed to create order' };
        }
    },

    updateOrderStatus: async (id, status, note = '') => {
        try {
            if (!id) {
                throw new Error('Order ID is required');
            }
            if (!status) {
                throw new Error('Status is required');
            }

            const response = await API.put(`/orders/${id}`, { status, note });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error.response?.data || { message: error.message || 'Failed to update order status' };
        }
    }
};
