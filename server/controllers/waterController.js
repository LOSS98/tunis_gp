// server/controllers/waterController.js
import * as db from '../config/db.js';
import WaterHistoryModel from '../models/waterHistoryModel.js';
import ParticipantModel from '../models/participantModel.js';

const WaterController = {
    async getAllWaterHistory(req, res) {
        try {
            const waterHistory = await WaterHistoryModel.findAll();
            res.status(200).json(waterHistory);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getWaterHistoryByParticipant(req, res) {
        try {
            const { bib } = req.params;

            // Check if participant exists
            const participant = await ParticipantModel.findByBib(bib);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found' });
            }

            const waterHistory = await WaterHistoryModel.findByParticipantBib(bib);
            const totalBottles = await WaterHistoryModel.getTotalByParticipant(bib);

            res.status(200).json({
                waterHistory,
                totalBottles
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getWaterHistoryByCountry(req, res) {
        try {
            const { country } = req.params;

            const waterHistory = await WaterHistoryModel.findByCountry(country);
            const totalBottles = await WaterHistoryModel.getTotalByCountry(country);

            res.status(200).json({
                waterHistory,
                totalBottles
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async addBottles(req, res) {
        try {
            const { bib, bottles_taken } = req.body;

            // Check if participant exists and has a valid bib
            const participant = await ParticipantModel.findByBib(bib);
            if (!participant) {
                return res.status(404).json({ message: 'Participant not found or invalid BIB' });
            }

            // Get the staff ID from the JWT
            const taken_from = req.user.userId;

            // Add bottles to participant
            const waterEntry = await WaterHistoryModel.addBottles({
                participant_bib: bib,
                bottles_taken,
                taken_from
            });

            res.status(201).json({
                message: 'Water bottles added successfully',
                waterEntry
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async addBottlesToCountry(req, res) {
        try {
            const { country, bottles_per_participant } = req.body;

            if (!country || !bottles_per_participant || bottles_per_participant <= 0) {
                return res.status(400).json({ message: 'Valid country and bottles_per_participant are required' });
            }

            // Get the staff ID from the JWT
            const taken_from = req.user.userId;

            // Add bottles to all participants from the country
            const results = await WaterHistoryModel.addBottlesForCountry(
                country,
                bottles_per_participant,
                taken_from
            );

            if (results.length === 0) {
                return res.status(404).json({ message: 'No participants found for this country or no participants have BIB numbers assigned' });
            }

            res.status(201).json({
                message: `Water bottles added successfully to ${results.length} participants from ${country}`,
                count: results.length
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getTotalBottlesByCountry(req, res) {
        try {
            // Get all countries with participants
            const result = await db.query(`
                SELECT DISTINCT country, COUNT(id) as participant_count
                FROM participants
                WHERE country IS NOT NULL
                GROUP BY country
                ORDER BY country
            `);

            const countries = result.rows;
            const countryData = [];

            // Get total bottles for each country
            for (const country of countries) {
                const totalBottles = await WaterHistoryModel.getTotalByCountry(country.country);
                countryData.push({
                    country: country.country,
                    participant_count: country.participant_count,
                    total_bottles: totalBottles
                });
            }

            res.status(200).json(countryData);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async addBottlesToAllParticipants(req, res) {
        try {
            const { bottles_per_participant } = req.body;

            if (!bottles_per_participant || bottles_per_participant <= 0) {
                return res.status(400).json({ message: 'Valid bottles_per_participant is required' });
            }

            // Get the staff ID from the JWT
            const taken_from = req.user.userId;

            // Get all participants with BIB numbers
            const result = await db.query(`
                SELECT bib FROM participants
                WHERE bib IS NOT NULL
            `);

            const participants = result.rows;
            let successCount = 0;

            // Add bottles to each participant
            for (const participant of participants) {
                try {
                    await WaterHistoryModel.addBottles({
                        participant_bib: participant.bib,
                        bottles_taken: bottles_per_participant,
                        taken_from
                    });
                    successCount++;
                } catch (err) {
                    console.error(`Error adding bottles to participant ${participant.bib}:`, err);
                }
            }

            if (successCount === 0) {
                return res.status(404).json({ message: 'No participants with BIB numbers found' });
            }

            res.status(201).json({
                message: `Water bottles added successfully to ${successCount} participants`,
                count: successCount
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

export default WaterController;