import api from '../api/axios';

export const bookService = {
    searchBooks: async (params) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.search) queryParams.append('search', params.search);
            if (params.category) queryParams.append('category', params.category);
            if (params.minPrice) queryParams.append('minPrice', params.minPrice);
            if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
            if (params.inStock !== undefined) queryParams.append('inStock', params.inStock);
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            
            const url = `/books/search?${queryParams.toString()}`;
            const response = await api.get(url);
            return response.data?.data || [];
        } catch (error) {
            console.error('Search books error:', error);
            throw error.response?.data || error;
        }
    },

    getCategories: async () => {
        try {
            const response = await api.get('/books/categories');
            return response.data?.data || [];
        } catch (error) {
            console.error('Get categories error:', error);
            throw error.response?.data || error;
        }
    },

    getAllBooks: async () => {
        try {
            const response = await api.get('/books');
            return {
                success: true,
                data: response.data?.data || response.data || []
            };
        } catch (error) {
            console.error('Get all books error:', error);
            throw error.response?.data || error;
        }
    },

    getBook: async (id) => {
        try {
            const response = await api.get(`/books/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get book error:', error);
            throw error.response?.data || error;
        }
    },    createBook: async (bookData) => {
        try {
            // Log des données envoyées pour le débogage
            console.log('Sending book data:', Object.fromEntries(bookData));
            
            const response = await api.post('/books', bookData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return {
                success: true,
                ...response.data
            };
        } catch (error) {
            console.error('Create book error:', error);
            console.error('Server response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création du livre'
            };
        }
    },    updateBook: async (id, bookData) => {
        try {
            const formData = new FormData();
            Object.keys(bookData).forEach(key => {
                if (bookData[key] !== undefined) {
                    formData.append(key, bookData[key]);
                }
            });
            const response = await api.put(`/books/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {
                success: true,
                ...response.data
            };
        } catch (error) {
            console.error('Update book error:', error);
            console.error('Server response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour'
            };
        }
    },

    deleteBook: async (id) => {
        try {
            const response = await api.delete(`/books/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete book error:', error);
            throw error.response?.data || error;
        }
    },

    getMyBooks: async () => {
        try {
            const response = await api.get('/books/my-books');
            return {
                success: true,
                data: response.data?.data || response.data || []
            };
        } catch (error) {
            console.error('Get my books error:', error);
            throw error.response?.data || error;
        }
    },

    getAuthorStats: async () => {
        try {
            const response = await api.get('/books/author/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching author stats:', error);
            throw error.response?.data || error;
        }
    },

    getBookPublicDetails: async (bookId) => {
        try {
            const response = await api.get(`/books/public/${bookId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};