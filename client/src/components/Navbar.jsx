import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="navbar">
            <div className="navbar-brand">
                <Link to="/">Authentication System</Link>
            </div>
            <div className="navbar-menu">
                <Link to="/">Home</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/profile">My Profile</Link>
                        {currentUser?.user?.role === 'admin' && (
                            <Link to="/admin">Admin Dashboard</Link>
                        )}
                        <a href="#" onClick={handleLogout}>
                            Logout ({currentUser?.user?.name})
                        </a>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;