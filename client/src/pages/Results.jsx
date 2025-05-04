// client/src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CountryFlag from '../components/CountryFlag';

const Results = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);

            // Get all published results
            const response = await axios.get('/api/events/results');

            // Sort events by date and time
            const sortedEvents = response.data.sort((a, b) => {
                if (a.start_day !== b.start_day) {
                    return new Date(a.start_day) - new Date(b.start_day);
                }
                return a.start_time.localeCompare(b.start_time);
            });

            setEvents(sortedEvents);
        } catch (error) {
            setError('Error loading events results');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventResults = async (eventId) => {
        try {
            setLoadingResults(true);

            // Get results for this event
            const response = await axios.get(`/api/participations/event/${eventId}`);

            // Sort by medal (nulls last) and then by mark
            const sortedResults = response.data.sort((a, b) => {
                if (a.medal === null && b.medal !== null) return 1;
                if (a.medal !== null && b.medal === null) return -1;
                if (a.medal !== null && b.medal !== null) return a.medal - b.medal;

                // If no medals or same medals, sort by mark (if numeric)
                const markA = parseFloat(a.mark);
                const markB = parseFloat(b.mark);

                if (!isNaN(markA) && !isNaN(markB)) {
                    return markA - markB;
                }

                // Fallback to alphabetical sort by mark
                return String(a.mark || '').localeCompare(String(b.mark || ''));
            });

            setResults(sortedResults);
        } catch (error) {
            console.error('Error loading results:', error);
            setResults([]);
        } finally {
            setLoadingResults(false);
        }
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        fetchEventResults(event.id);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMedalEmoji = (medal) => {
        switch (medal) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return null;
        }
    };

    if (loading) {
        return <div className="loading">Loading results...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="results-page">
            <h1>Competition Results</h1>

            {events.length === 0 ? (
                <div className="no-events">
                    <p>No published results found.</p>
                </div>
            ) : (
                <div className="results-container">
                    <div className="events-list">
                        <h2>Events</h2>
                        <div className="events-grid">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                                    onClick={() => handleEventSelect(event)}
                                >
                                    <div className="event-date">{formatDate(event.start_day)}</div>
                                    <div className="event-discipline">{event.discipline}</div>
                                    <div className="event-details">
                                        {event.gender} - {event.phase}
                                    </div>
                                    <div className="event-classes">
                                        {Array.isArray(event.classes)
                                            ? event.classes.join(', ')
                                            : event.classes}
                                    </div>
                                    {event.results_path_pdf && (
                                        <div className="event-pdf">
                                            <a
                                                href={event.results_path_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                PDF
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="results-display">
                        {selectedEvent ? (
                            <>
                                <h2>
                                    {selectedEvent.discipline} - {selectedEvent.phase} ({selectedEvent.gender})
                                </h2>
                                <h3>{formatDate(selectedEvent.start_day)}</h3>

                                {loadingResults ? (
                                    <div className="loading">Loading results data...</div>
                                ) : results.length > 0 ? (
                                    <table className="results-table">
                                        <thead>
                                        <tr>
                                            <th>Position</th>
                                            <th>Medal</th>
                                            <th>BIB</th>
                                            <th>Name</th>
                                            <th>Country</th>
                                            <th>Class</th>
                                            <th>Mark</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {results.map((result, index) => (
                                            <tr key={index} className={result.medal ? 'medal-row' : ''}>
                                                <td>{index + 1}</td>
                                                <td className="medal-cell">
                                                    {getMedalEmoji(result.medal)}
                                                </td>
                                                <td>{result.bib}</td>
                                                <td>
                                                    {result.first_name} {result.last_name}
                                                </td>
                                                <td>
                                                    {result.country && (
                                                        <CountryFlag countryCode={result.country} />
                                                    )}
                                                </td>
                                                <td>{result.class}</td>
                                                <td className="mark-cell">{result.mark}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No results data available for this event.</p>
                                )}
                            </>
                        ) : (
                            <div className="select-prompt">
                                <p>Select an event from the list to view results</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;