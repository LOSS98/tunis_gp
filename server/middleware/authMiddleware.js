import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to check roles
export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: insufficient role' });
        }
    };
};