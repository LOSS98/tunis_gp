// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CountryFlag from '../components/CountryFlag';
import QRCodeDisplay from '../components/QRCodeDisplay';
import axios from 'axios';

const Profile = () => {
    const { currentUser, fetchUserProfile } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getProfile = async () => {
            try {
                const result = await fetchUserProfile();

                if (result.success) {
                    setProfileData(result.data);

                    // If user is an athlete, fetch upcoming events
                    if (result.data.role === 'athlete') {
                        await fetchUpcomingEvents(result.data.id);
                    }
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError('Error loading profile');
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [fetchUserProfile]);

    // Fetch upcoming events for athletes
    const fetchUpcomingEvents = async (participantId) => {
        try {
            const response = await axios.get(`/api/participations/participant/${participantId}/upcoming`);
            setUpcomingEvents(response.data);
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <h2>My Profile</h2>

                {profileData ? (
                    <div>
                        {profileData.profilePicture && (
                            <div className="profile-picture">
                                <img src={profileData.profilePicture} alt="Profile" />
                            </div>
                        )}

                        <div className="profile-info">
                            <strong>First Name:</strong> {profileData.first_name}
                        </div>

                        <div className="profile-info">
                            <strong>Last Name:</strong> {profileData.last_name}
                        </div>

                        <div className="profile-info">
                            <strong>Email:</strong> {profileData.email}
                        </div>

                        <div className="profile-info">
                            <strong>Role:</strong> {profileData.role}
                        </div>

                        {profileData.bib && (
                            <div className="profile-info">
                                <strong>BIB Number:</strong> {profileData.bib}
                            </div>
                        )}

                        {profileData.class && (
                            <div className="profile-info">
                                <strong>Class:</strong> {profileData.class}
                            </div>
                        )}

                        {profileData.country && (
                            <div className="profile-info">
                                <strong>Country:</strong>
                                <CountryFlag countryCode={profileData.country} />
                            </div>
                        )}

                        {profileData.last_connection && (
                            <div className="profile-info">
                                <strong>Last Connection:</strong> {new Date(profileData.last_connection).toLocaleString()}
                            </div>
                        )}

                        {profileData.created_on && (
                            <div className="profile-info">
                                <strong>Created On:</strong> {new Date(profileData.created_on).toLocaleString()}
                            </div>
                        )}
                    </div>
                ) : (
                    // Display basic info from auth context
                    <div>
                        <div className="profile-info">
                            <strong>First Name:</strong> {currentUser?.user?.firstName}
                        </div>

                        <div className="profile-info">
                            <strong>Last Name:</strong> {currentUser?.user?.lastName}
                        </div>

                        <div className="profile-info">
                            <strong>Email:</strong> {currentUser?.user?.email}
                        </div>

                        <div className="profile-info">
                            <strong>Role:</strong> {currentUser?.user?.role}
                        </div>

                        {currentUser?.user?.bib && (
                            <div className="profile-info">
                                <strong>BIB Number:</strong> {currentUser?.user?.bib}
                            </div>
                        )}

                        {currentUser?.user?.class && (
                            <div className="profile-info">
                                <strong>Class:</strong> {currentUser?.user?.class}
                            </div>
                        )}

                        {currentUser?.user?.country && (
                            <div className="profile-info">
                                <strong>Country:</strong>
                                <CountryFlag countryCode={currentUser.user.country} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Show QR Code for all users */}
            <div className="qrcode-section">
                <QRCodeDisplay />
            </div>

            {/* Show upcoming events for athletes */}
            {profileData?.role === 'athlete' && upcomingEvents.length > 0 && (
                <div className="upcoming-events">
                    <h2>My Upcoming Events</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Discipline</th>
                            <th>Phase</th>
                            <th>Gender</th>
                        </tr>
                        </thead>
                        <tbody>
                        {upcomingEvents.map((event, index) => (
                            <tr key={index}>
                                <td>{new Date(event.start_day).toLocaleDateString()}</td>
                                <td>{event.start_time}</td>
                                <td>{event.discipline}</td>
                                <td>{event.phase}</td>
                                <td>{event.gender}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Profile;