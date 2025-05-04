// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Provider that wraps the application
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on load
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            // Configure Axios with the token
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });

            const userData = response.data;

            if (userData.token) {
                localStorage.setItem('user', JSON.stringify(userData));
                setCurrentUser(userData);
                setIsAuthenticated(true);
                // Configure Axios with the token
                axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login error'
            };
        }
    };

    // Register function
    const register = async (firstName, lastName, email, password, bib = null, country = null, participantClass = null) => {
        try {
            const response = await axios.post('/api/auth/register', {
                firstName,
                lastName,
                email,
                password,
                bib,
                country,
                participantClass
            });

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration error'
            };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticated(false);
        // Remove token from Axios headers
        delete axios.defaults.headers.common['Authorization'];
    };

    // Fetch user profile
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('/api/auth/profile');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error retrieving profile'
            };
        }
    };

    // Generate QR code
    const generateQRCode = async () => {
        try {
            const response = await axios.get('/api/auth/generate-qr');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error generating QR code'
            };
        }
    };

    // Set/Reset password
    const setPassword = async (email, token, password) => {
        try {
            const response = await axios.post('/api/auth/set-password', {
                email,
                token,
                password
            });
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error setting password'
            };
        }
    };

    // Request password reset
    const resetPassword = async (email) => {
        try {
            const response = await axios.post('/api/participants/reset-password', {
                email
            });
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error requesting password reset'
            };
        }
    };

    // Context value
    const value = {
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        fetchUserProfile,
        generateQRCode,
        setPassword,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};