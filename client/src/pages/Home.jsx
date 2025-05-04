import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            <h1>Welcome to our application</h1>
            <p>
                This application demonstrates a simple authentication system
                with Express.js, PostgreSQL and React.
            </p>

            {isAuthenticated ? (
                <div>
                    <p>You are logged in!</p>
                    <Link to="/profile">
                        <button>View my profile</button>
                    </Link>
                </div>
            ) : (
                <div>
                    <p>Login to access all features</p>
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                    <Link to="/register" style={{ marginLeft: '10px' }}>
                        <button>Register</button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Home;