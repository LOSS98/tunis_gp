import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UsersList from '../components/UsersList';
import Register from './Register';

const AdminDashboard = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('users');

    // Redirect if not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Only admin can access this page
    if (currentUser?.user?.role !== 'admin') {
        return <Navigate to="/profile" />;
    }

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="admin-nav">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Users Management
                </button>
                <button
                    className={activeTab === 'register' ? 'active' : ''}
                    onClick={() => setActiveTab('register')}
                >
                    Register New User
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'users' && <UsersList />}
                {activeTab === 'register' && <Register />}
            </div>
        </div>
    );
};

export default AdminDashboard;