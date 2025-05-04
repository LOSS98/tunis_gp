import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [roleId, setRoleId] = useState(3); // Default to volunteer
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const { register, currentUser } = useAuth();
    const navigate = useNavigate();

    // Check if current user is admin
    useEffect(() => {
        if (currentUser && currentUser.user && currentUser.user.role === 'admin') {
            setIsAdmin(true);

            // Fetch available roles
            const fetchRoles = async () => {
                try {
                    const response = await axios.get('/api/auth/roles', {
                        headers: {
                            Authorization: `Bearer ${currentUser.token}`
                        }
                    });
                    setRoles(response.data);
                } catch (error) {
                    console.error('Error fetching roles:', error);
                }
            };

            fetchRoles();
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            setError('');
            setLoading(true);

            // Admin registers with role
            if (isAdmin) {
                const response = await axios.post('/api/auth/admin/register', {
                    name,
                    email,
                    password,
                    phone,
                    role_id: roleId
                }, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`
                    }
                });

                if (response.status === 201) {
                    setSuccess('User registered successfully!');
                    // Clear form
                    setName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setPhone('');
                    setRoleId(3);
                }
            } else {
                // Normal user registration
                const result = await register(name, email, password, phone);

                if (result.success) {
                    setSuccess('Registration successful! You can now login.');
                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError('An error occurred during registration');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2>{isAdmin ? 'Register New User' : 'Register'}</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone (optional)</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                {isAdmin && roles.length > 0 && (
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            value={roleId}
                            onChange={(e) => setRoleId(parseInt(e.target.value))}
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            {!isAdmin && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            )}
        </div>
    );
};

export default Register;