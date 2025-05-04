// server/models/participationModel.js
import * as db from '../config/db.js';

const ParticipationModel = {
    async findAll() {
        try {
            const result = await db.query(`
                SELECT 
                    p.participant_id, 
                    p.event_id, 
                    p.mark, 
                    p.medal, 
                    p.added_on, 
                    p.added_by,
                    part.first_name, 
                    part.last_name, 
                    part.bib,
                    part.country,
                    part.class,
                    e.discipline,
                    e.phase,
                    e.start_day,
                    e.start_time
                FROM participations p
                JOIN participants part ON p.participant_id = part.id
                JOIN events e ON p.event_id = e.id
                ORDER BY e.start_day, e.start_time
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findByParticipant(participantId) {
        try {
            const result = await db.query(`
                SELECT 
                    p.participant_id, 
                    p.event_id, 
                    p.mark, 
                    p.medal, 
                    p.added_on, 
                    p.added_by,
                    e.discipline,
                    e.phase,
                    e.gender,
                    e.start_day,
                    e.start_time
                FROM participations p
                JOIN events e ON p.event_id = e.id
                WHERE p.participant_id = $1
                ORDER BY e.start_day, e.start_time
            `, [participantId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findByEvent(eventId) {
        try {
            const result = await db.query(`
                SELECT 
                    p.participant_id, 
                    p.event_id, 
                    p.mark, 
                    p.medal, 
                    p.added_on, 
                    p.added_by,
                    part.first_name, 
                    part.last_name, 
                    part.bib,
                    part.country,
                    part.class
                FROM participations p
                JOIN participants part ON p.participant_id = part.id
                WHERE p.event_id = $1
                ORDER BY p.medal NULLS LAST, p.mark
            `, [eventId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findUpcomingByParticipant(participantId) {
        try {
            const result = await db.query(`
                SELECT 
                    p.participant_id, 
                    p.event_id, 
                    p.mark, 
                    p.medal, 
                    p.added_on, 
                    p.added_by,
                    e.discipline,
                    e.phase,
                    e.gender,
                    e.start_day,
                    e.start_time
                FROM participations p
                JOIN events e ON p.event_id = e.id
                WHERE p.participant_id = $1
                AND (e.start_day > CURRENT_DATE OR (e.start_day = CURRENT_DATE AND e.start_time >= CURRENT_TIME))
                ORDER BY e.start_day, e.start_time
            `, [participantId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async create(participationData) {
        const {
            participant_id,
            event_id,
            mark = null,
            medal = null,
            added_by
        } = participationData;

        try {
            const result = await db.query(`
                INSERT INTO participations (
                    participant_id,
                    event_id,
                    mark,
                    medal,
                    added_by,
                    added_on
                )
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `, [participant_id, event_id, mark, medal, added_by]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async updateResult(participant_id, event_id, resultData) {
        const { mark, medal, added_by } = resultData;

        try {
            const result = await db.query(`
                UPDATE participations
                SET
                    mark = $1,
                    medal = $2,
                    added_by = $3,
                    added_on = NOW()
                WHERE participant_id = $4 AND event_id = $5
                RETURNING *
            `, [mark, medal, added_by, participant_id, event_id]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async delete(participant_id, event_id) {
        try {
            await db.query(`
                DELETE FROM participations
                WHERE participant_id = $1 AND event_id = $2
            `, [participant_id, event_id]);
            return true;
        } catch (error) {
            throw error;
        }
    },

    async getMedalistsByEvent(eventId) {
        try {
            const result = await db.query(`
                SELECT 
                    p.participant_id, 
                    p.event_id, 
                    p.mark, 
                    p.medal,
                    part.first_name, 
                    part.last_name, 
                    part.bib,
                    part.country
                FROM participations p
                JOIN participants part ON p.participant_id = part.id
                WHERE p.event_id = $1
                AND p.medal IS NOT NULL
                ORDER BY p.medal
            `, [eventId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
};

export default ParticipationModel;