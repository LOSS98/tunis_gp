// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Schedule from './pages/Schedule';
import Results from './pages/Results';
import SetPassword from './pages/SetPassword';
import ResetPassword from './pages/ResetPassword';

// Private Pages
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ParticipantsList from './pages/ParticipantsList';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import WaterManagement from './pages/WaterManagement';
import ScanQrCode from './pages/ScanQrCode';

// Protected route that checks if user is authenticated and has the required role
const PrivateRoute = ({ children, requiredRoles = [] }) => {
    const { isAuthenticated, currentUser } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If specific roles are required, check if user has one of those roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser?.user?.role)) {
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
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin/LOC Only Routes */}
                    <Route
                        path="/admin/participants"
                        element={
                            <PrivateRoute requiredRoles={['admin', 'loc']}>
                                <ParticipantsList />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/events"
                        element={
                            <PrivateRoute requiredRoles={['admin', 'loc']}>
                                <EventsList />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/events/:id"
                        element={
                            <PrivateRoute requiredRoles={['admin', 'loc']}>
                                <EventDetails />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin Only Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <PrivateRoute requiredRoles={['admin']}>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin/LOC/Volunteer Routes */}
                    <Route
                        path="/water-management"
                        element={
                            <PrivateRoute requiredRoles={['admin', 'loc', 'volunteer']}>
                                <WaterManagement />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin/LOC/Volunteer/Security Routes */}
                    <Route
                        path="/scan-qr"
                        element={
                            <PrivateRoute requiredRoles={['admin', 'loc', 'volunteer', 'security']}>
                                <ScanQrCode />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}

export default App;