// server/middleware/authMiddleware.js
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

// Middleware to check if user is admin or LOC
export const isAdminOrLOC = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'admin' || req.user.role === 'loc') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: admin or LOC role required' });
    }
};

// Middleware to check if user can manage water bottles (LOC, volunteer, admin)
export const canManageWater = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedRoles = ['admin', 'loc', 'volunteer'];

    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: not authorized to manage water bottles' });
    }
};

// Middleware to check if user can view participant data (security, volunteer, admin, LOC)
export const canViewParticipantData = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedRoles = ['admin', 'loc', 'volunteer', 'security'];

    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: not authorized to view participant data' });
    }
};

// Middleware to check if user can manage events and results (admin, LOC)
export const canManageEvents = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedRoles = ['admin', 'loc'];

    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: not authorized to manage events' });
    }
};

// Middleware to check if user is accessing their own data or has admin/LOC rights
export const isOwnDataOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const requestedUserId = parseInt(req.params.id);

    if (
        requestedUserId === req.user.userId ||
        req.user.role === 'admin' ||
        req.user.role === 'loc'
    ) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: can only access your own data' });
    }
};