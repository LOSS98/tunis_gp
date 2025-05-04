// client/src/pages/WaterManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CountryFlag from '../components/CountryFlag';
import countryList from '../utils/countryList';

const WaterManagement = () => {
    const { currentUser } = useAuth();
    const [view, setView] = useState('add'); // 'add', 'history', 'country'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [bib, setBib] = useState('');
    const [bottlesCount, setBottlesCount] = useState(1);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [bottlesPerParticipant, setBottlesPerParticipant] = useState(1);
    const [waterHistory, setWaterHistory] = useState([]);
    const [countryData, setCountryData] = useState([]);

    // Check if user is admin or LOC to show additional options
    const isAdminOrLOC = ['admin', 'loc'].includes(currentUser?.user?.role);

    useEffect(() => {
        // If view is history, load water history
        if (view === 'history') {
            fetchWaterHistory();
        }

        // If view is country, load country data
        if (view === 'country' && isAdminOrLOC) {
            fetchCountryTotals();
        }
    }, [view]);

    const fetchWaterHistory = async () => {
        try {
            setLoading(true);
            setError('');

            let response;
            if (isAdminOrLOC) {
                // Admin and LOC can see all water history
                response = await axios.get('/api/water');
            } else if (bib) {
                // Volunteers can only see history for a specific BIB
                response = await axios.get(`/api/water/participant/${bib}`);
                setBib(''); // Clear BIB after fetch
            } else {
                setError('Please enter a BIB number to view history');
                setLoading(false);
                return;
            }

            setWaterHistory(response.data.waterHistory || response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching water history');
        } finally {
            setLoading(false);
        }
    };

    const fetchCountryTotals = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get('/api/water/totals/country');
            setCountryData(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching country data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBottles = async () => {
        try {
            setLoading(true);
            setError('');
            setMessage('');

            if (!bib) {
                setError('Please enter a BIB number');
                setLoading(false);
                return;
            }

            const response = await axios.post('/api/water/add', {
                bib,
                bottles_taken: parseInt(bottlesCount)
            });

            setMessage(`Successfully added ${bottlesCount} water bottle(s) to participant with BIB ${bib}`);
            setBib('');
            setBottlesCount(1);
        } catch (error) {
            setError(error.response?.data?.message || 'Error adding water bottles');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBottlesToCountry = async () => {
        try {
            setLoading(true);
            setError('');
            setMessage('');

            if (!selectedCountry) {
                setError('Please select a country');
                setLoading(false);
                return;
            }

            const response = await axios.post('/api/water/add/country', {
                country: selectedCountry,
                bottles_per_participant: parseInt(bottlesPerParticipant)
            });

            setMessage(`Successfully added ${bottlesPerParticipant} water bottle(s) to each participant from ${countryList.find(c => c.code === selectedCountry)?.name}`);
            setSelectedCountry('');
            setBottlesPerParticipant(1);
        } catch (error) {
            setError(error.response?.data?.message || 'Error adding water bottles to country');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBottlesToAll = async () => {
        try {
            setLoading(true);
            setError('');
            setMessage('');

            const response = await axios.post('/api/water/add/all', {
                bottles_per_participant: parseInt(bottlesPerParticipant)
            });

            setMessage(`Successfully added ${bottlesPerParticipant} water bottle(s) to ${response.data.count} participants`);
            setBottlesPerParticipant(1);
        } catch (error) {
            setError(error.response?.data?.message || 'Error adding water bottles to all participants');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="water-management-page">
            <h1>Water Bottle Management</h1>

            <div className="view-tabs">
                <button
                    className={view === 'add' ? 'active' : ''}
                    onClick={() => setView('add')}
                >
                    Add Bottles
                </button>
                <button
                    className={view === 'history' ? 'active' : ''}
                    onClick={() => setView('history')}
                >
                    Water History
                </button>
                {isAdminOrLOC && (
                    <button
                        className={view === 'country' ? 'active' : ''}
                        onClick={() => setView('country')}
                    >
                        Country Management
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            {view === 'add' && (
                <div className="add-bottles-section">
                    <div className="form-card">
                        <h2>Add Water Bottles by BIB</h2>
                        <div className="form-group">
                            <label htmlFor="bib">BIB Number:</label>
                            <input
                                type="text"
                                id="bib"
                                value={bib}
                                onChange={(e) => setBib(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bottlesCount">Number of Bottles:</label>
                            <input
                                type="number"
                                id="bottlesCount"
                                min="1"
                                max="10"
                                value={bottlesCount}
                                onChange={(e) => setBottlesCount(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            onClick={handleAddBottles}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Add Water Bottles'}
                        </button>
                    </div>

                    {isAdminOrLOC && (
                        <>
                            <div className="form-card">
                                <h2>Add Water Bottles by Country</h2>
                                <div className="form-group">
                                    <label htmlFor="country">Country:</label>
                                    <select
                                        id="country"
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        required
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
                                    <label htmlFor="bottlesPerParticipant">Bottles per Participant:</label>
                                    <input
                                        type="number"
                                        id="bottlesPerParticipant"
                                        min="1"
                                        max="10"
                                        value={bottlesPerParticipant}
                                        onChange={(e) => setBottlesPerParticipant(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    onClick={handleAddBottlesToCountry}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Add Bottles to Country'}
                                </button>
                            </div>

                            <div className="form-card">
                                <h2>Add Water Bottles to All Participants</h2>
                                <div className="form-group">
                                    <label htmlFor="allBottlesPerParticipant">Bottles per Participant:</label>
                                    <input
                                        type="number"
                                        id="allBottlesPerParticipant"
                                        min="1"
                                        max="5"
                                        value={bottlesPerParticipant}
                                        onChange={(e) => setBottlesPerParticipant(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    onClick={handleAddBottlesToAll}
                                    disabled={loading}
                                    className="warning-button"
                                >
                                    {loading ? 'Processing...' : 'Add Bottles to ALL Participants'}
                                </button>
                                <p className="warning-text">This will add water bottles to all participants with a BIB number.</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {view === 'history' && (
                <div className="history-section">
                    <h2>Water Bottle History</h2>

                    {!isAdminOrLOC && (
                        <div className="form-inline">
                            <input
                                type="text"
                                placeholder="Enter BIB number"
                                value={bib}
                                onChange={(e) => setBib(e.target.value)}
                            />
                            <button onClick={fetchWaterHistory} disabled={loading}>
                                {loading ? 'Loading...' : 'Search'}
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div>Loading water history...</div>
                    ) : waterHistory.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                <tr>
                                    <th>BIB</th>
                                    <th>Participant</th>
                                    <th>Country</th>
                                    <th>Bottles</th>
                                    <th>Given By</th>
                                    <th>Date & Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {waterHistory.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.participant_bib}</td>
                                        <td>
                                            {entry.first_name} {entry.last_name}
                                        </td>
                                        <td>
                                            {entry.country && (
                                                <CountryFlag countryCode={entry.country} />
                                            )}
                                        </td>
                                        <td>{entry.bottles_taken}</td>
                                        <td>
                                            {entry.staff_first_name} {entry.staff_last_name}
                                        </td>
                                        <td>
                                            {new Date(entry.taken_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No water history found.</p>
                    )}
                </div>
            )}

            {view === 'country' && isAdminOrLOC && (
                <div className="country-section">
                    <h2>Water Bottle Statistics by Country</h2>

                    {loading ? (
                        <div>Loading country data...</div>
                    ) : countryData.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                <tr>
                                    <th>Country</th>
                                    <th>Participants</th>
                                    <th>Total Bottles</th>
                                    <th>Average per Participant</th>
                                </tr>
                                </thead>
                                <tbody>
                                {countryData.map((country, index) => (
                                    <tr key={index}>
                                        <td>
                                            <CountryFlag countryCode={country.country} />
                                        </td>
                                        <td>{country.participant_count}</td>
                                        <td>{country.total_bottles || 0}</td>
                                        <td>
                                            {country.total_bottles
                                                ? (country.total_bottles / country.participant_count).toFixed(2)
                                                : '0.00'
                                            }
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No country data found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default WaterManagement;