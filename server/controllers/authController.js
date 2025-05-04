// server/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import ParticipantModel from '../models/participantModel.js';
import jwtConfig from '../config/jwt.js';
import IdentificationCodeModel from '../models/identificationCodeModel.js';

const AuthController = {
    async register(req, res) {
        try {
            const {
                firstName,
                lastName,
                email,
                password,
                bib = null,
                country = null,
                participantClass = null,
                role_id
            } = req.body;

            // Vérifier si l'email a été invité
            const invitationResult = await db.query(
                'SELECT * FROM invitations WHERE email = $1 AND registered = FALSE',
                [email]
            );

            const invitation = invitationResult.rows[0];

            // Si l'utilisateur n'est pas un admin, vérifier l'invitation
            if (!req.user || req.user.role !== 'admin') {
                if (!invitation) {
                    return res.status(403).json({
                        message: 'Vous devez être invité pour vous inscrire. Contactez un administrateur.'
                    });
                }
            }

            // Check if participant already exists with this email
            const existingParticipant = await ParticipantModel.findByEmail(email);
            if (existingParticipant) {
                return res.status(400).json({ message: 'Email is already in use' });
            }

            // Si l'invitation existe, utiliser le rôle défini dans l'invitation
            const roleToUse = invitation ? invitation.role_id : (role_id || 5);

            // Get creator ID from JWT if available
            const created_by = req.user ? req.user.userId : null;

            // Create new participant
            const newParticipant = await ParticipantModel.create({
                bib,
                firstName,
                lastName,
                email,
                password,
                country,
                class: participantClass,
                role_id: roleToUse,
                created_by
            });

            // Marquer l'invitation comme utilisée
            if (invitation) {
                await db.query(
                    'UPDATE invitations SET registered = TRUE WHERE email = $1',
                    [email]
                );
            }

            res.status(201).json({
                message: 'Participant created successfully',
                participant: {
                    id: newParticipant.id,
                    firstName: newParticipant.first_name,
                    lastName: newParticipant.last_name,
                    email: newParticipant.email,
                    bib: newParticipant.bib,
                    country: newParticipant.country,
                    class: newParticipant.class
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Check if participant exists
            const participant = await ParticipantModel.findByEmail(email);
            if (!participant) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Check if password is set
            if (!participant.password) {
                return res.status(401).json({ message: 'Password not set. Please use the password reset feature.' });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, participant.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Get role
            const role = await ParticipantModel.getRoleById(participant.role_id);

            // Update last connection timestamp
            await ParticipantModel.updateLastConnection(participant.id);

            // Create JWT token
            const token = jwt.sign(
                {
                    userId: participant.id,
                    role: role.name
                },
                jwtConfig.secret,
                { expiresIn: jwtConfig.expiresIn }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: participant.id,
                    firstName: participant.first_name,
                    lastName: participant.last_name,
                    email: participant.email,
                    bib: participant.bib,
                    role: role.name,
                    profilePicture: participant.profilePicture,
                    country: participant.country,
                    class: participant.class
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async setPassword(req, res) {
        try {
            const { email, token, password } = req.body;

            // Validate token
            // TODO: Implement a proper password reset token system

            // Find participant by email
            const participant = await ParticipantModel.findByEmail(email);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            // Update password
            await ParticipantModel.updatePassword(participant.id, password);

            res.status(200).json({ message: 'Password set successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const participant = await ParticipantModel.findById(userId);

            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            res.status(200).json(participant);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getAllRoles(req, res) {
        try {
            const roles = await ParticipantModel.getAllRoles();
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async generateQRCode(req, res) {
        try {
            const userId = req.user.userId;

            // Generate a new identification code
            const code = await IdentificationCodeModel.generateCode(userId);

            if (!code) {
                return res.status(500).json({ message: 'Failed to generate identification code' });
            }

            res.status(200).json({
                token: code.token,
                valid_till: code.valid_till
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async validateQRCode(req, res) {
        try {
            const { token } = req.params;

            // Validate the code
            const participantData = await IdentificationCodeModel.getParticipantUpcomingEvents(token);

            if (!participantData) {
                return res.status(404).json({ message: 'Invalid or expired QR code' });
            }

            res.status(200).json(participantData);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

export default AuthController;