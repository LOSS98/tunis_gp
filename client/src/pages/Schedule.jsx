// client/src/pages/Schedule.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Schedule = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [availableDates, setAvailableDates] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            // Extract unique dates from events
            const dates = [...new Set(events.map(event => event.start_day))].sort();
            setAvailableDates(dates);

            // Default to the earliest date if none selected
            if (!selectedDate && dates.length > 0) {
                setSelectedDate(dates[0]);
            }
        }
    }, [events]);

    useEffect(() => {
        if (selectedDate) {
            // Filter events by selected date
            const filtered = events.filter(event => event.start_day === selectedDate);
            setFilteredEvents(filtered);
        }
    }, [selectedDate, events]);

    const fetchEvents = async () => {
        try {
            setLoading(true);

            // Get all published start lists
            const response = await axios.get('/api/events/start-lists');

            // Sort events by date and time
            const sortedEvents = response.data.sort((a, b) => {
                if (a.start_day !== b.start_day) {
                    return new Date(a.start_day) - new Date(b.start_day);
                }
                return a.start_time.localeCompare(b.start_time);
            });

            setEvents(sortedEvents);
        } catch (error) {
            setError('Error loading events schedule');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    if (loading) {
        return <div className="loading">Loading schedule...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="schedule-page">
            <h1>Competition Schedule</h1>

            {events.length === 0 ? (
                <div className="no-events">
                    <p>No published events found.</p>
                </div>
            ) : (
                <>
                    <div className="date-selector">
                        <label htmlFor="date-select">Select Date:</label>
                        <select
                            id="date-select"
                            value={selectedDate}
                            onChange={handleDateChange}
                        >
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {formatDate(date)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedDate && (
                        <div className="schedule-date">
                            <h2>{formatDate(selectedDate)}</h2>

                            {filteredEvents.length === 0 ? (
                                <p>No events scheduled for this date.</p>
                            ) : (
                                <div className="schedule-table">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Discipline</th>
                                            <th>Phase</th>
                                            <th>Gender</th>
                                            <th>Classes</th>
                                            <th>Area</th>
                                            <th>Details</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredEvents.map(event => (
                                            <tr key={event.id}>
                                                <td>{event.start_time}</td>
                                                <td>{event.discipline}</td>
                                                <td>{event.phase}</td>
                                                <td>{event.gender}</td>
                                                <td>
                                                    {Array.isArray(event.classes)
                                                        ? event.classes.join(', ')
                                                        : event.classes}
                                                </td>
                                                <td>{event.area || 'TBD'}</td>
                                                <td>
                                                    {event.start_list_path_pdf && (
                                                        <a
                                                            href={event.start_list_path_pdf}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="pdf-link"
                                                        >
                                                            Start List PDF
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Schedule;