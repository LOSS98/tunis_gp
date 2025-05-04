import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        // Only administrators can see the user list
        if (currentUser && currentUser.user.role === 'admin') {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users', {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error loading users list');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!currentUser || currentUser.user.role !== 'admin') {
        return <div>You don't have permission to view this page.</div>;
    }

    return (
        <div className="users-list">
            <h2>Users Management</h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Last Connection</th>
                    <th>Created On</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>{user.last_connection ? new Date(user.last_connection).toLocaleString() : 'Never'}</td>
                        <td>{new Date(user.created_on).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersList;