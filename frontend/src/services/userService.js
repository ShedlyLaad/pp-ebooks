import API from '../api/axios';

export const userService = {
    updateProfile: async (userData) => {
        try {
            const response = await API.put('/users/profile', userData);
            return response.data.user;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error.response?.data || error;
        }
    },

    updateProfileImage: async (formData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            const response = await API.put('/users/profile/image', formData, config);
            return response.data.user;
        } catch (error) {
            console.error('Error updating profile image:', error);
            throw error.response?.data || error;
        }
    },

    getProfile: async () => {
        try {
            const response = await API.get('/users/me');
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error.response?.data || error;
        }
    },
};
