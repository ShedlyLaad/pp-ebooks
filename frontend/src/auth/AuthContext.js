import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuthStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await API.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (credentials) => {
        try {
            const response = await API.post('/login', credentials);
            const { token, user: userData } = response.data;
            
            localStorage.setItem('token', token);
            setUser(userData);
            
            // Redirect based on user role
            switch (userData.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'author':
                    navigate('/author');
                    break;
                default:
                    navigate('/user/home');
            }
            
            toast.success('Login successful!');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
        toast.info('You have been logged out');
    }, [navigate]);    const register = async (userData) => {
        try {
            const response = await API.post('/register', userData);
            const { token, user } = response.data;
            
            // Store token immediately
            localStorage.setItem('token', token);
            setUser(user);

            toast.success('Registration successful!');
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }    const updateUser = (updatedUserData) => {
        setUser(prev => ({
            ...prev,
            ...updatedUserData,
        }));
    };

    const value = {
        user,
        login,
        logout,
        register,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};