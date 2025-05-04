// server/models/identificationCodeModel.js
import * as db from '../config/db.js';
import crypto from 'crypto';

const IdentificationCodeModel = {
    async generateCode(participantId) {
        try {
            // Generate a random token
            const token = crypto.randomBytes(32).toString('hex');

            // Set expiration time (1 minute from now)
            const validTill = new Date();
            validTill.setMinutes(validTill.getMinutes() + 1);

            // Insert new code
            const result = await db.query(`
                INSERT INTO identification_code (
                    token,
                    participant_id,
                    valid_till
                )
                VALUES ($1, $2, $3)
                RETURNING *
            `, [token, participantId, validTill]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async validateCode(token) {
        try {
            // Get code and check if it's valid
            const result = await db.query(`
                SELECT 
                    ic.*,
                    p.id as participant_id,
                    p.bib,
                    p.first_name,
                    p.last_name,
                    p.email,
                    p.profilePicture,
                    p.country,
                    p.class,
                    r.name as role
                FROM identification_code ic
                JOIN participants p ON ic.participant_id = p.id
                JOIN roles r ON p.role_id = r.id
                WHERE ic.token = $1 AND ic.valid_till > NOW()
            `, [token]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async getParticipantUpcomingEvents(token) {
        try {
            // First validate the token
            const participantData = await this.validateCode(token);

            if (!participantData) {
                return null;
            }

            // If the participant is an athlete, get upcoming events
            if (participantData.role === 'athlete' && participantData.bib) {
                const result = await db.query(`
                    SELECT 
                        e.id,
                        e.discipline,
                        e.phase,
                        e.gender,
                        e.start_day,
                        e.start_time,
                        e.area
                    FROM participations p
                    JOIN events e ON p.event_id = e.id
                    JOIN participants part ON p.participant_id = part.id
                    WHERE part.id = $1
                    AND (e.start_day > CURRENT_DATE OR (e.start_day = CURRENT_DATE AND e.start_time >= CURRENT_TIME))
                    ORDER BY e.start_day, e.start_time
                    LIMIT 5
                `, [participantData.participant_id]);

                return {
                    participant: participantData,
                    events: result.rows
                };
            }

            return {
                participant: participantData,
                events: []
            };
        } catch (error) {
            throw error;
        }
    },

    async deleteExpiredCodes() {
        try {
            await db.query(`
                DELETE FROM identification_code
                WHERE valid_till < NOW()
            `);
            return true;
        } catch (error) {
            throw error;
        }
    }
};

export default IdentificationCodeModel;