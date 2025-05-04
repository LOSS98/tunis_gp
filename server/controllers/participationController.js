// server/controllers/participationController.js
import ParticipationModel from '../models/participationModel.js';
import ParticipantModel from '../models/participantModel.js';
import EventModel from '../models/eventModel.js';

const ParticipationController = {
    async getAllParticipations(req, res) {
        try {
            const participations = await ParticipationModel.findAll();
            res.status(200).json(participations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipationsByParticipant(req, res) {
        try {
            const participantId = parseInt(req.params.participantId);

            // Check if participant exists
            const participant = await ParticipantModel.findById(participantId);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            const participations = await ParticipationModel.findByParticipant(participantId);
            res.status(200).json(participations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getParticipationsByEvent(req, res) {
        try {
            const eventId = parseInt(req.params.eventId);

            // Check if event exists
            const event = await EventModel.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            const participations = await ParticipationModel.findByEvent(eventId);
            res.status(200).json(participations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async createParticipation(req, res) {
        try {
            const { participant_id, event_id, mark = null, medal = null } = req.body;

            // Check if participant exists
            const participant = await ParticipantModel.findById(participant_id);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            // Check if event exists
            const event = await EventModel.findById(event_id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Get the added_by ID from the JWT
            const added_by = req.user.userId;

            // Create participation
            const participation = await ParticipationModel.create({
                participant_id,
                event_id,
                mark,
                medal,
                added_by
            });

            res.status(201).json({
                message: 'Participation created successfully',
                participation
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async updateResult(req, res) {
        try {
            const participant_id = parseInt(req.params.participantId);
            const event_id = parseInt(req.params.eventId);
            const { mark, medal } = req.body;

            // Validate participant and event exist and there's a participation record
            const participant = await ParticipantModel.findById(participant_id);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            const event = await EventModel.findById(event_id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Get the added_by ID from the JWT
            const added_by = req.user.userId;

            // Update the result
            const updatedParticipation = await ParticipationModel.updateResult(
                participant_id,
                event_id,
                { mark, medal, added_by }
            );

            if (!updatedParticipation) {
                return res.status(404).json({ message: 'Participation not found' });
            }

            res.status(200).json({
                message: 'Result updated successfully',
                participation: updatedParticipation
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async deleteParticipation(req, res) {
        try {
            const participant_id = parseInt(req.params.participantId);
            const event_id = parseInt(req.params.eventId);

            // Delete the participation
            await ParticipationModel.delete(participant_id, event_id);

            res.status(200).json({
                message: 'Participation deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getMedalistsByEvent(req, res) {
        try {
            const eventId = parseInt(req.params.eventId);

            // Check if event exists
            const event = await EventModel.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            const medalists = await ParticipationModel.getMedalistsByEvent(eventId);
            res.status(200).json(medalists);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getUpcomingEventsByParticipant(req, res) {
        try {
            const participantId = parseInt(req.params.participantId);

            // Check if participant exists
            const participant = await ParticipantModel.findById(participantId);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            const upcomingEvents = await ParticipationModel.findUpcomingByParticipant(participantId);
            res.status(200).json(upcomingEvents);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

export default ParticipationController;