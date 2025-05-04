// server/models/waterHistoryModel.js
import * as db from '../config/db.js';

const WaterHistoryModel = {
    async findAll() {
        try {
            const result = await db.query(`
                SELECT 
                    w.id,
                    w.participant_bib,
                    w.bottles_taken,
                    w.taken_from,
                    w.taken_at,
                    p.first_name,
                    p.last_name,
                    p.country,
                    staff.first_name as staff_first_name,
                    staff.last_name as staff_last_name
                FROM water_history w
                JOIN participants p ON w.participant_bib = p.bib
                LEFT JOIN participants staff ON w.taken_from = staff.id
                ORDER BY w.taken_at DESC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findByParticipantBib(bib) {
        try {
            const result = await db.query(`
                SELECT 
                    w.id,
                    w.participant_bib,
                    w.bottles_taken,
                    w.taken_from,
                    w.taken_at,
                    staff.first_name as staff_first_name,
                    staff.last_name as staff_last_name
                FROM water_history w
                LEFT JOIN participants staff ON w.taken_from = staff.id
                WHERE w.participant_bib = $1
                ORDER BY w.taken_at DESC
            `, [bib]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findByCountry(country) {
        try {
            const result = await db.query(`
                SELECT 
                    w.id,
                    w.participant_bib,
                    w.bottles_taken,
                    w.taken_from,
                    w.taken_at,
                    p.first_name,
                    p.last_name,
                    staff.first_name as staff_first_name,
                    staff.last_name as staff_last_name
                FROM water_history w
                JOIN participants p ON w.participant_bib = p.bib
                LEFT JOIN participants staff ON w.taken_from = staff.id
                WHERE p.country = $1
                ORDER BY w.taken_at DESC
            `, [country]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async getTotalByParticipant(bib) {
        try {
            const result = await db.query(`
                SELECT SUM(bottles_taken) as total_bottles
                FROM water_history
                WHERE participant_bib = $1
            `, [bib]);
            return result.rows[0].total_bottles || 0;
        } catch (error) {
            throw error;
        }
    },

    async getTotalByCountry(country) {
        try {
            const result = await db.query(`
                SELECT SUM(w.bottles_taken) as total_bottles
                FROM water_history w
                JOIN participants p ON w.participant_bib = p.bib
                WHERE p.country = $1
            `, [country]);
            return result.rows[0].total_bottles || 0;
        } catch (error) {
            throw error;
        }
    },

    async addBottles(waterData) {
        const {
            participant_bib,
            bottles_taken,
            taken_from
        } = waterData;

        try {
            const result = await db.query(`
                INSERT INTO water_history (
                    participant_bib,
                    bottles_taken,
                    taken_from,
                    taken_at
                )
                VALUES ($1, $2, $3, NOW())
                RETURNING *
            `, [participant_bib, bottles_taken, taken_from]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async addBottlesForCountry(country, bottlesPerParticipant, takenFrom) {
        try {
            // Get all participants from the country
            const participantsResult = await db.query(`
                SELECT bib FROM participants
                WHERE country = $1 AND bib IS NOT NULL
            `, [country]);

            const participants = participantsResult.rows;
            const results = [];

            // Add bottles for each participant
            for (const participant of participants) {
                const waterEntry = await this.addBottles({
                    participant_bib: participant.bib,
                    bottles_taken: bottlesPerParticipant,
                    taken_from: takenFrom
                });
                results.push(waterEntry);
            }

            return results;
        } catch (error) {
            throw error;
        }
    }
};

export default WaterHistoryModel;