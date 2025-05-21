import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    timeout: parseInt(process.env.REACT_APP_TIMEOUT) || 30000,
    withCredentials: true,
});

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
        // Add retry count to config
        config.retryCount = 0;
        console.log('API Request:', config);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { config } = error;
        
        if (!config || !config.retry) {
            return Promise.reject(error);
        }

        config.retryCount = config.retryCount || 0;

        if (config.retryCount >= MAX_RETRIES) {
            return Promise.reject(error);
        }

        config.retryCount += 1;

        // Log the retry attempt
        console.log(`Retrying request (${config.retryCount}/${MAX_RETRIES}):`, config.url);

        // Wait before retrying
        await sleep(RETRY_DELAY * config.retryCount);

        return API(config);
    }
);

export default API;