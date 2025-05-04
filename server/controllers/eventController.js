// server/controllers/eventController.js
import EventModel from '../models/eventModel.js';
import ParticipationModel from '../models/participationModel.js';

const EventController = {
    async getAllEvents(req, res) {
        try {
            const events = await EventModel.findAll();
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getEventById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const event = await EventModel.findById(id);

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            res.status(200).json(event);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getEventsByDate(req, res) {
        try {
            const { date } = req.params;
            const events = await EventModel.findByDate(date);
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getEventsByClass(req, res) {
        try {
            const { className } = req.params;
            const events = await EventModel.findByClass(className);
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getPublishedStartLists(req, res) {
        try {
            const events = await EventModel.findPublishedStartLists();
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getPublishedResults(req, res) {
        try {
            const events = await EventModel.findPublishedResults();
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async createEvent(req, res) {
        try {
            const {
                start_day,
                start_time,
                classes,
                discipline,
                gender,
                phase,
                remarks,
                area,
                start_list_path_pdf,
                results_path_pdf,
                publish_start_list,
                publish_results
            } = req.body;

            // Validation
            if (!start_day || !start_time || !classes || !discipline || !gender || !phase) {
                return res.status(400).json({ message: 'Required fields missing' });
            }

            const newEvent = await EventModel.create({
                start_day,
                start_time,
                classes,
                discipline,
                gender,
                phase,
                remarks,
                area,
                start_list_path_pdf,
                results_path_pdf,
                publish_start_list,
                publish_results
            });

            res.status(201).json({
                message: 'Event created successfully',
                event: newEvent
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async updateEvent(req, res) {
        try {
            const id = parseInt(req.params.id);
            const {
                start_day,
                start_time,
                classes,
                discipline,
                gender,
                phase,
                remarks,
                area,
                start_list_path_pdf,
                results_path_pdf,
                publish_start_list,
                publish_results
            } = req.body;

            // Check if event exists
            const event = await EventModel.findById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Update event
            const updatedEvent = await EventModel.update(id, {
                start_day,
                start_time,
                classes,
                discipline,
                gender,
                phase,
                remarks,
                area,
                start_list_path_pdf,
                results_path_pdf,
                publish_start_list,
                publish_results
            });

            res.status(200).json({
                message: 'Event updated successfully',
                event: updatedEvent
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async deleteEvent(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Check if event exists
            const event = await EventModel.findById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Delete event
            await EventModel.delete(id);

            res.status(200).json({
                message: 'Event deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getEventParticipants(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Check if event exists
            const event = await EventModel.findById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Get participants
            const participants = await ParticipationModel.findByEvent(id);

            res.status(200).json(participants);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getUpcomingEvents(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const events = await EventModel.getUpcomingEvents(limit);
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

export default EventController;