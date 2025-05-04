// server/models/eventModel.js
import * as db from '../config/db.js';

const EventModel = {
    async findAll() {
        try {
            const result = await db.query(`
                SELECT * FROM events
                ORDER BY start_day, start_time
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        try {
            const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByClass(className) {
        try {
            const result = await db.query(`
                SELECT * FROM events
                WHERE $1 = ANY(classes)
                ORDER BY start_day, start_time
            `, [className]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findByDate(date) {
        try {
            const result = await db.query(`
                SELECT * FROM events
                WHERE start_day = $1
                ORDER BY start_time
            `, [date]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findPublishedStartLists() {
        try {
            const result = await db.query(`
                SELECT * FROM events
                WHERE publish_start_list = TRUE
                ORDER BY start_day, start_time
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findPublishedResults() {
        try {
            const result = await db.query(`
                SELECT * FROM events
                WHERE publish_results = TRUE
                ORDER BY start_day, start_time
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async create(eventData) {
        const {
            start_day,
            start_time,
            classes,
            discipline,
            gender,
            phase,
            remarks = null,
            area = null,
            start_list_path_pdf = null,
            results_path_pdf = null,
            publish_start_list = false,
            publish_results = false
        } = eventData;

        try {
            const result = await db.query(`
                INSERT INTO events (
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
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            `, [
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
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async update(id, eventData) {
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
        } = eventData;

        try {
            const result = await db.query(`
                UPDATE events
                SET
                    start_day = COALESCE($1, start_day),
                    start_time = COALESCE($2, start_time),
                    classes = COALESCE($3, classes),
                    discipline = COALESCE($4, discipline),
                    gender = COALESCE($5, gender),
                    phase = COALESCE($6, phase),
                    remarks = COALESCE($7, remarks),
                    area = COALESCE($8, area),
                    start_list_path_pdf = COALESCE($9, start_list_path_pdf),
                    results_path_pdf = COALESCE($10, results_path_pdf),
                    publish_start_list = COALESCE($11, publish_start_list),
                    publish_results = COALESCE($12, publish_results)
                WHERE id = $13
                RETURNING *
            `, [
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
                publish_results,
                id
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            await db.query('DELETE FROM events WHERE id = $1', [id]);
            return true;
        } catch (error) {
            throw error;
        }
    },

    async getUpcomingEvents(limit = 5) {
        try {
            const result = await db.query(`
                SELECT * FROM events
                WHERE start_day >= CURRENT_DATE
                ORDER BY start_day, start_time
                LIMIT $1
            `, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
};

export default EventModel;