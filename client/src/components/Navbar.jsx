// client/src/components/Navbar.jsx
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
                <Link to="/">GP Tunis - Tracking System</Link>
            </div>
            <div className="navbar-menu">
                <Link to="/">Home</Link>
                <Link to="/schedule">Schedule</Link>
                <Link to="/results">Results</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/profile">My Profile</Link>

                        {/* Admin and LOC can access participant management */}
                        {(currentUser?.user?.role === 'admin' || currentUser?.user?.role === 'loc') && (
                            <Link to="/admin/participants">Participants</Link>
                        )}

                        {/* Admin and LOC can access event management */}
                        {(currentUser?.user?.role === 'admin' || currentUser?.user?.role === 'loc') && (
                            <Link to="/admin/events">Events</Link>
                        )}

                        {/* Admin, LOC, and volunteers can access water management */}
                        {['admin', 'loc', 'volunteer'].includes(currentUser?.user?.role) && (
                            <Link to="/water-management">Water Management</Link>
                        )}

                        {/* Admin, LOC, volunteer and security can scan QR codes */}
                        {['admin', 'loc', 'volunteer', 'security'].includes(currentUser?.user?.role) && (
                            <Link to="/scan-qr">Scan QR</Link>
                        )}

                        {/* Admin dashboard only for admin */}
                        {currentUser?.user?.role === 'admin' && (
                            <Link to="/admin/dashboard">Admin Dashboard</Link>
                        )}

                        <a href="#" onClick={handleLogout}>
                            Logout ({currentUser?.user?.firstName})
                        </a>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;