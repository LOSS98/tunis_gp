// client/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email) {
            setError('Email is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await resetPassword(email);

            if (result.success) {
                setSuccess('If the email exists in our system, a reset link has been sent.');
                setEmail(''); // Clear the form
            } else {
                // Still show the same success message even on error for security
                setSuccess('If the email exists in our system, a reset link has been sent.');
            }
        } catch (error) {
            // Use the same generic message for security reasons
            setSuccess('If the email exists in our system, a reset link has been sent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2>Reset Your Password</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {!success ? (
                <form onSubmit={handleSubmit}>
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

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Reset Password'}
                    </button>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        Remembered your password? <Link to="/login">Login</Link>
                    </div>
                </form>
            ) : (
                <div className="reset-password-message">
                    <p>Check your email for instructions to reset your password.</p>
                    <Link to="/login">
                        <button>Back to Login</button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;