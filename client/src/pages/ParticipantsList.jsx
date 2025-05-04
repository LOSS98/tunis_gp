// client/src/pages/ParticipantsList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CountryFlag from '../components/CountryFlag';
import countryList from '../utils/countryList';

const ParticipantsList = () => {
    const { currentUser } = useAuth();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bib: '',
        country: '',
        participantClass: '',
        role_id: '5', // Default to athlete
    });
    const [roles, setRoles] = useState([]);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        fetchParticipants();
        fetchRoles();
    }, []);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get('/api/participants');
            setParticipants(response.data);
        } catch (error) {
            setError('Error loading participants');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/auth/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setFormError('');
            setFormSuccess('');

            const response = await axios.post('/api/auth/register', formData);

            setFormSuccess('Participant added successfully!');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                bib: '',
                country: '',
                participantClass: '',
                role_id: '5', // Reset to default (athlete)
            });

            // Refresh the list
            fetchParticipants();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Error adding participant');
        }
    };

    const filteredParticipants = participants.filter(participant => {
        const matchesSearch =
            participant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (participant.bib && participant.bib.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filter === 'all') return matchesSearch;
        return matchesSearch && participant.role === filter;
    });

    if (loading && participants.length === 0) {
        return <div className="loading">Loading participants...</div>;
    }

    return (
        <div className="participants-list-page">
            <h1>Participants Management</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="controls">
                <div className="search-filter">
                    <input
                        type="text"
                        placeholder="Search participants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="role-filter"
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="add-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Hide Form' : 'Add Participant'}
                </button>
            </div>

            {showForm && (
                <div className="add-participant-form">
                    <h2>Add New Participant</h2>

                    {formError && <div className="error-message">{formError}</div>}
                    {formSuccess && <div className="success-message">{formSuccess}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bib">BIB Number</label>
                                <input
                                    type="text"
                                    id="bib"
                                    name="bib"
                                    value={formData.bib}
                                    onChange={handleInputChange}
                                />
                                <small>Required for athletes</small>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Country</option>
                                    {countryList.map(country => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="participantClass">Class</label>
                                <input
                                    type="text"
                                    id="participantClass"
                                    name="participantClass"
                                    value={formData.participantClass}
                                    onChange={handleInputChange}
                                />
                                <small>For athlete categorization</small>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="role_id">Role *</label>
                                <select
                                    id="role_id"
                                    name="role_id"
                                    value={formData.role_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-button">
                                Add Participant
                            </button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="participants-table">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>BIB</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Country</th>
                        <th>Class</th>
                        <th>Role</th>
                        <th>Created On</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredParticipants.map(participant => (
                        <tr key={participant.id}>
                            <td>{participant.id}</td>
                            <td>{participant.bib || 'N/A'}</td>
                            <td>{participant.first_name} {participant.last_name}</td>
                            <td>{participant.email}</td>
                            <td>
                                {participant.country && (
                                    <CountryFlag countryCode={participant.country} />
                                )}
                            </td>
                            <td>{participant.class || 'N/A'}</td>
                            <td>{participant.role}</td>
                            <td>
                                {participant.created_on ? new Date(participant.created_on).toLocaleDateString() : 'N/A'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParticipantsList;