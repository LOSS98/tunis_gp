import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CountryFlag from '../components/CountryFlag';

const Profile = () => {
    const { currentUser, fetchUserProfile } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getProfile = async () => {
            try {
                const result = await fetchUserProfile();

                if (result.success) {
                    setProfileData(result.data);
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

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="profile-card">
            <h2>My Profile</h2>

            {profileData ? (
                <div>
                    <div className="profile-info">
                        <strong>First Name:</strong> {profileData.firstName}
                    </div>

                    <div className="profile-info">
                        <strong>Last Name:</strong> {profileData.lastName}
                    </div>

                    <div className="profile-info">
                        <strong>Email:</strong> {profileData.email}
                    </div>

                    <div className="profile-info">
                        <strong>Role:</strong> {profileData.role}
                    </div>

                    {profileData.country && (
                        <div className="profile-info">
                            <strong>Country:</strong>
                            <CountryFlag countryCode={profileData.country} />
                        </div>
                    )}

                    {profileData.phone && (
                        <div className="profile-info">
                            <strong>Phone:</strong> {profileData.phone}
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
                // Display basic info from auth context (modify this too)
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

                    {currentUser?.user?.country && (
                        <div className="profile-info">
                            <strong>Country:</strong>
                            <CountryFlag countryCode={currentUser.user.country} />
                        </div>
                    )}

                    {currentUser?.user?.phone && (
                        <div className="profile-info">
                            <strong>Phone:</strong> {currentUser?.user?.phone}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;