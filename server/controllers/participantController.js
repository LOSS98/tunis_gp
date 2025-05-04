// server/controllers/participantController.js
import ParticipantModel from '../models/participantModel.js';
import ParticipationModel from '../models/participationModel.js';

const ParticipantController = {
    async getAllParticipants(req, res) {
        try {
            const participants = await ParticipantModel.findAll();
            res.status(200).json(participants);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipantById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const participant = await ParticipantModel.findById(id);

            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            res.status(200).json(participant);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipantByBib(req, res) {
        try {
            const { bib } = req.params;
            const participant = await ParticipantModel.findByBib(bib);

            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            res.status(200).json(participant);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipantsByRole(req, res) {
        try {
            const { roleId } = req.params;
            const participants = await ParticipantModel.getParticipantsByRole(roleId);
            res.status(200).json(participants);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipantsByCountry(req, res) {
        try {
            const { country } = req.params;
            const participants = await ParticipantModel.getParticipantsByCountry(country);
            res.status(200).json(participants);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async updateParticipant(req, res) {
        try {
            const id = parseInt(req.params.id);
            const {
                firstName,
                lastName,
                email,
                bib,
                country,
                participantClass,
                role_id,
                profilePicture
            } = req.body;

            // Check if participant exists
            const participant = await ParticipantModel.findById(id);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            // Only admins and LOC staff can update role
            if (role_id &&
                req.user.role !== 'admin' &&
                req.user.role !== 'loc' &&
                id !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized to change role' });
            }

            // Update participant
            const updatedParticipant = await ParticipantModel.update(id, {
                firstName,
                lastName,
                email,
                bib,
                country,
                class: participantClass,
                role_id,
                profilePicture
            });

            res.status(200).json({
                message: 'Participant updated successfully',
                participant: updatedParticipant
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipantEvents(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Check if participant exists
            const participant = await ParticipantModel.findById(id);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            const participations = await ParticipationModel.findByParticipant(id);
            res.status(200).json(participations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipantUpcomingEvents(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Check if participant exists
            const participant = await ParticipantModel.findById(id);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            const upcomingEvents = await ParticipationModel.findUpcomingByParticipant(id);
            res.status(200).json(upcomingEvents);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async resetPassword(req, res) {
        try {
            const { email } = req.body;

            // Find participant by email
            const participant = await ParticipantModel.findByEmail(email);
            if (!participant) {
                // Pour des raisons de sécurité, ne révélez pas que l'email n'existe pas
                return res.status(200).json({ message: 'Si l\'email existe, un lien de réinitialisation a été envoyé' });
            }

            // TODO: Implémenter l'envoi d'email
            // Générer un token et envoyer un email de réinitialisation

            res.status(200).json({ message: 'Si l\'email existe, un lien de réinitialisation a été envoyé' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    }
};

export default ParticipantController;