import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/userModel.js';
import jwtConfig from '../config/jwt.js';

const AuthController = {
    async register(req, res) {
        try {
            const { name, email, password, phone, profilePicture, role_id } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }

            // Get creator ID from JWT if available
            const created_by = req.user ? req.user.userId : null;

            // Create new user (default role is volunteer if not specified)
            const newUser = await UserModel.create({
                name,
                email,
                password,
                phone,
                profilePicture,
                role_id: role_id || 3, // Default to volunteer
                created_by
            });

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Check if user exists
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Get role
            const role = await UserModel.getRoleById(user.role_id);

            // Update last connection timestamp
            await UserModel.updateLastConnection(user.id);

            // Create JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    role: role.name
                },
                jwtConfig.secret,
                { expiresIn: jwtConfig.expiresIn }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: role.name,
                    profilePicture: user.profilePicture,
                    phone: user.phone
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getAllRoles(req, res) {
        try {
            const roles = await UserModel.getAllRoles();
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

export default AuthController;