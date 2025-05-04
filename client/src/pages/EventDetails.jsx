// client/src/pages/EventDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CountryFlag from '../components/CountryFlag';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('details'); // 'details', 'participants', 'add-participants'
    const [selectedAthletes, setSelectedAthletes] = useState([]);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEventDetails();
        fetchParticipants();
        fetchAthletes();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get(`/api/events/${id}`);
            setEvent(response.data);
        } catch (error) {
            setError('Error loading event details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async () => {
        try {
            const response = await axios.get(`/api/participations/event/${id}`);
            setParticipants(response.data);
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    };

    const fetchAthletes = async () => {
        try {
            // Get all participants with role "athlete"
            const response = await axios.get('/api/participants/role/5');
            setAthletes(response.data);
        } catch (error) {
            console.error('Error loading athletes:', error);
        }
    };

    const handleUpdateEvent = async (field, value) => {
        try {
            setError('');

            const updateData = { [field]: value };
            await axios.put(`/api/events/${id}`, updateData);

            // Update local state
            setEvent({
                ...event,
                ...updateData
            });

            // Show success notification (you might want to add a state for this)
        } catch (error) {
            setError('Error updating event');
            console.error(error);
        }
    };

    const handleAthleteSelection = (athleteId) => {
        if (selectedAthletes.includes(athleteId)) {
            setSelectedAthletes(selectedAthletes.filter(id => id !== athleteId));
        } else {
            setSelectedAthletes([...selectedAthletes, athleteId]);
        }
    };

    const handleAddParticipants = async () => {
        if (selectedAthletes.length === 0) {
            setFormError('Please select at least one athlete');
            return;
        }

        try {
            setFormError('');
            setFormSuccess('');

            // Add each selected athlete to the event
            const promises = selectedAthletes.map(athleteId =>
                axios.post('/api/participations', {
                    participant_id: athleteId,
                    event_id: id
                })
            );

            await Promise.all(promises);

            setFormSuccess(`Added ${selectedAthletes.length} participant(s) to the event`);
            setSelectedAthletes([]);

            // Refresh participants list
            fetchParticipants();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Error adding participants');
        }
    };

    const handleUpdateResult = async (participantId, field, value) => {
        try {
            // Find the current participant
            const participant = participants.find(p => p.participant_id === participantId);

            if (!participant) return;

            // Create update data
            const updateData = {
                mark: field === 'mark' ? value : participant.mark,
                medal: field === 'medal' ? (value === '' ? null : parseInt(value)) : participant.medal
            };

            // Send update
            await axios.put(`/api/participations/${participantId}/${id}`, updateData);

            // Update local state
            setParticipants(participants.map(p =>
                p.participant_id === participantId ? { ...p, ...updateData } : p
            ));
        } catch (error) {
            console.error('Error updating result:', error);
        }
    };

    const handleDeleteParticipation = async (participantId) => {
        if (!confirm('Are you sure you want to remove this participant from the event?')) {
            return;
        }

        try {
            await axios.delete(`/api/participations/${participantId}/${id}`);

            // Update local state
            setParticipants(participants.filter(p => p.participant_id !== participantId));
        } catch (error) {
            console.error('Error removing participant:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Filter athletes for the add participants tab
    const filteredAthletes = athletes.filter(athlete => {
        // Exclude athletes already in the event
        const alreadyInEvent = participants.some(p => p.participant_id === athlete.id);
        if (alreadyInEvent) return false;

        // Apply search filter
        return (
            athlete.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            athlete.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (athlete.bib && athlete.bib.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    if (loading && !event) {
        return <div className="loading">Loading event details...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!event) {
        return <div className="not-found">Event not found</div>;
    }

    return (
        <div className="event-details-page">
            <button
                className="back-button"
                onClick={() => navigate('/admin/events')}
            >
                &larr; Back to Events
            </button>

            <h1>{event.discipline} - {event.phase}</h1>

            <div className="event-meta">
                <div className="meta-item">
                    <span className="meta-label">Date:</span>
                    <span className="meta-value">{formatDate(event.start_day)}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Time:</span>
                    <span className="meta-value">{event.start_time}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Gender:</span>
                    <span className="meta-value">{event.gender}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Classes:</span>
                    <span className="meta-value">
                        {Array.isArray(event.classes)
                            ? event.classes.join(', ')
                            : event.classes}
                    </span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Area:</span>
                    <span className="meta-value">{event.area || 'N/A'}</span>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={tab === 'details' ? 'active' : ''}
                    onClick={() => setTab('details')}
                >
                    Event Details
                </button>
                <button
                    className={tab === 'participants' ? 'active' : ''}
                    onClick={() => setTab('participants')}
                >
                    Participants ({participants.length})
                </button>
                <button
                    className={tab === 'add-participants' ? 'active' : ''}
                    onClick={() => setTab('add-participants')}
                >
                    Add Participants
                </button>
            </div>

            <div className="tab-content">
                {tab === 'details' && (
                    <div className="details-tab">
                        <div className="form-card">
                            <h2>Event Information</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Remarks</label>
                                    <textarea
                                        value={event.remarks || ''}
                                        onChange={(e) => handleUpdateEvent('remarks', e.target.value)}
                                        rows="4"
                                        placeholder="Additional information about the event"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="publish_start_list"
                                        checked={event.publish_start_list || false}
                                        onChange={(e) => handleUpdateEvent('publish_start_list', e.target.checked)}
                                    />
                                    <label htmlFor="publish_start_list">Publish Start List</label>
                                </div>

                                <div className="form-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="publish_results"
                                        checked={event.publish_results || false}
                                        onChange={(e) => handleUpdateEvent('publish_results', e.target.checked)}
                                    />
                                    <label htmlFor="publish_results">Publish Results</label>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start List PDF</label>
                                    <input
                                        type="text"
                                        value={event.start_list_path_pdf || ''}
                                        onChange={(e) => handleUpdateEvent('start_list_path_pdf', e.target.value)}
                                        placeholder="URL to the start list PDF"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Results PDF</label>
                                    <input
                                        type="text"
                                        value={event.results_path_pdf || ''}
                                        onChange={(e) => handleUpdateEvent('results_path_pdf', e.target.value)}
                                        placeholder="URL to the results PDF"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'participants' && (
                    <div className="participants-tab">
                        <h2>Participants & Results</h2>

                        {participants.length === 0 ? (
                            <div className="no-participants">
                                <p>No participants added to this event yet.</p>
                                <button
                                    onClick={() => setTab('add-participants')}
                                    className="add-button"
                                >
                                    Add Participants
                                </button>
                            </div>
                        ) : (
                            <table className="participants-table">
                                <thead>
                                <tr>
                                    <th>BIB</th>
                                    <th>Name</th>
                                    <th>Country</th>
                                    <th>Class</th>
                                    <th>Mark</th>
                                    <th>Medal</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {participants.map(participant => (
                                    <tr key={participant.participant_id}>
                                        <td>{participant.bib || 'N/A'}</td>
                                        <td>{participant.first_name} {participant.last_name}</td>
                                        <td>
                                            {participant.country && (
                                                <CountryFlag countryCode={participant.country} />
                                            )}
                                        </td>
                                        <td>{participant.class || 'N/A'}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={participant.mark || ''}
                                                onChange={(e) => handleUpdateResult(
                                                    participant.participant_id,
                                                    'mark',
                                                    e.target.value
                                                )}
                                                placeholder="e.g. 10.25, DNS, DNF"
                                                className="mark-input"
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={participant.medal || ''}
                                                onChange={(e) => handleUpdateResult(
                                                    participant.participant_id,
                                                    'medal',
                                                    e.target.value
                                                )}
                                                className="medal-select"
                                            >
                                                <option value="">No Medal</option>
                                                <option value="1">Gold (1st)</option>
                                                <option value="2">Silver (2nd)</option>
                                                <option value="3">Bronze (3rd)</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteParticipation(participant.participant_id)}
                                                className="delete-button"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {tab === 'add-participants' && (
                    <div className="add-participants-tab">
                        <h2>Add Participants to Event</h2>

                        {formError && <div className="error-message">{formError}</div>}
                        {formSuccess && <div className="success-message">{formSuccess}</div>}

                        <div className="search-filter">
                            <input
                                type="text"
                                placeholder="Search athletes by name or BIB..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="athletes-selection">
                            {filteredAthletes.length === 0 ? (
                                <div className="no-athletes">
                                    <p>No athletes found or all athletes are already added to this event.</p>
                                </div>
                            ) : (
                                <>
                                    <table className="athletes-table">
                                        <thead>
                                        <tr>
                                            <th></th>
                                            <th>BIB</th>
                                            <th>Name</th>
                                            <th>Country</th>
                                            <th>Class</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredAthletes.map(athlete => (
                                            <tr
                                                key={athlete.id}
                                                className={selectedAthletes.includes(athlete.id) ? 'selected' : ''}
                                                onClick={() => handleAthleteSelection(athlete.id)}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAthletes.includes(athlete.id)}
                                                        onChange={() => {}} // Handled by the row click
                                                    />
                                                </td>
                                                <td>{athlete.bib || 'N/A'}</td>
                                                <td>{athlete.first_name} {athlete.last_name}</td>
                                                <td>
                                                    {athlete.country && (
                                                        <CountryFlag countryCode={athlete.country} />
                                                    )}
                                                </td>
                                                <td>{athlete.class || 'N/A'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    <div className="selection-actions">
                                        <div className="selection-count">
                                            {selectedAthletes.length} athlete(s) selected
                                        </div>

                                        <button
                                            onClick={handleAddParticipants}
                                            disabled={selectedAthletes.length === 0}
                                            className="add-participants-button"
                                        >
                                            Add Selected Athletes to Event
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetails;