// client/src/pages/EventsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        start_day: '',
        start_time: '',
        classes: [],
        discipline: '',
        gender: 'male',
        phase: '',
        remarks: '',
        area: '',
        publish_start_list: false,
        publish_results: false
    });
    const [classInput, setClassInput] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get('/api/events');

            // Sort events by date and time
            const sortedEvents = response.data.sort((a, b) => {
                if (a.start_day !== b.start_day) {
                    return new Date(a.start_day) - new Date(b.start_day);
                }
                return a.start_time.localeCompare(b.start_time);
            });

            setEvents(sortedEvents);
        } catch (error) {
            setError('Error loading events');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddClass = () => {
        if (classInput.trim() && !formData.classes.includes(classInput.trim())) {
            setFormData({
                ...formData,
                classes: [...formData.classes, classInput.trim()]
            });
            setClassInput('');
        }
    };

    const handleRemoveClass = (classToRemove) => {
        setFormData({
            ...formData,
            classes: formData.classes.filter(c => c !== classToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setFormError('');
            setFormSuccess('');

            const response = await axios.post('/api/events', formData);

            setFormSuccess('Event added successfully!');
            setFormData({
                start_day: '',
                start_time: '',
                classes: [],
                discipline: '',
                gender: 'male',
                phase: '',
                remarks: '',
                area: '',
                publish_start_list: false,
                publish_results: false
            });

            // Refresh the list
            fetchEvents();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Error adding event');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading && events.length === 0) {
        return <div className="loading">Loading events...</div>;
    }

    return (
        <div className="events-list-page">
            <h1>Events Management</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="controls">
                <button
                    className="add-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Hide Form' : 'Add Event'}
                </button>
            </div>

            {showForm && (
                <div className="add-event-form">
                    <h2>Add New Event</h2>

                    {formError && <div className="error-message">{formError}</div>}
                    {formSuccess && <div className="success-message">{formSuccess}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="start_day">Date *</label>
                                <input
                                    type="date"
                                    id="start_day"
                                    name="start_day"
                                    value={formData.start_day}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="start_time">Time *</label>
                                <input
                                    type="time"
                                    id="start_time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="discipline">Discipline *</label>
                                <input
                                    type="text"
                                    id="discipline"
                                    name="discipline"
                                    value={formData.discipline}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phase">Phase *</label>
                                <input
                                    type="text"
                                    id="phase"
                                    name="phase"
                                    value={formData.phase}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Final, Qualification, Heat 1"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="gender">Gender *</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="area">Area</label>
                                <input
                                    type="number"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    placeholder="Optional area number"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Classes *</label>
                            <div className="classes-input">
                                <input
                                    type="text"
                                    value={classInput}
                                    onChange={(e) => setClassInput(e.target.value)}
                                    placeholder="Add a class (e.g. T12, F34)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddClass}
                                    className="add-class-button"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="classes-list">
                                {formData.classes.map((cls, index) => (
                                    <div key={index} className="class-tag">
                                        {cls}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveClass(cls)}
                                            className="remove-class"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {formData.classes.length === 0 && (
                                    <div className="no-classes">No classes added</div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="remarks">Remarks</label>
                            <textarea
                                id="remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Optional additional information"
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="publish_start_list"
                                    name="publish_start_list"
                                    checked={formData.publish_start_list}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="publish_start_list">Publish Start List</label>
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="publish_results"
                                    name="publish_results"
                                    checked={formData.publish_results}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="publish_results">Publish Results</label>
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-button">
                                Add Event
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

            <div className="events-table">
                {events.length === 0 ? (
                    <div className="no-events">No events found.</div>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Discipline</th>
                            <th>Phase</th>
                            <th>Gender</th>
                            <th>Classes</th>
                            <th>Area</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {events.map(event => (
                            <tr key={event.id}>
                                <td>{formatDate(event.start_day)}</td>
                                <td>{event.start_time}</td>
                                <td>{event.discipline}</td>
                                <td>{event.phase}</td>
                                <td>{event.gender}</td>
                                <td>
                                    {Array.isArray(event.classes)
                                        ? event.classes.join(', ')
                                        : event.classes}
                                </td>
                                <td>{event.area || 'N/A'}</td>
                                <td>
                                    {event.publish_results ? (
                                        <span className="status-published">Results Published</span>
                                    ) : event.publish_start_list ? (
                                        <span className="status-list">Start List Published</span>
                                    ) : (
                                        <span className="status-draft">Draft</span>
                                    )}
                                </td>
                                <td>
                                    <Link to={`/admin/events/${event.id}`} className="view-button">
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EventsList;