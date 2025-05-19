import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Timeout after 30 seconds
    timeout: parseInt(process.env.REACT_APP_TIMEOUT) || 30000,
    // Add withCredentials for CORS
    withCredentials: true,
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Request interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
API.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    async (error) => {
        const { config, response } = error;
        
        // Skip retry for specific status codes or if we've already retried
        if (!config || !response || response.status === 404 || response.status === 403 || 
            config._retry || response.status === 401) {
            
            // Handle authentication errors
            if (response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            
            console.error('Response error:', {
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            return Promise.reject(error.response?.data || error);
        }

        // Implement retry logic for network errors and 500s
        if (!response || response.status >= 500) {
            config._retry = config._retry || 0;
            
            if (config._retry < MAX_RETRIES) {
                config._retry++;
                await sleep(RETRY_DELAY * config._retry);
                return API(config);
            }
        }

        return Promise.reject(error.response?.data || error);
    }
);

export default API;