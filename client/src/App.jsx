import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Protected route that checks if user is authenticated
const PrivateRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, currentUser } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If a specific role is required, check if user has that role
    if (requiredRole && currentUser?.user?.role !== requiredRole) {
        return <Navigate to="/profile" />;
    }

    return children;
};

function App() {
    return (
        <div className="App">
            <Navbar />
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute requiredRole="admin">
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}

export default App;