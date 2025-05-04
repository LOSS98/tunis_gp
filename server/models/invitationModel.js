// server/models/invitationModel.js
import * as db from '../config/db.js';

const InvitationModel = {
    async findByEmail(email) {
        try {
            const result = await db.query(
                'SELECT * FROM invitations WHERE email = $1 AND registered = FALSE',
                [email]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async create(invitationData) {
        const { email, role_id, invited_by } = invitationData;

        try {
            const result = await db.query(
                'INSERT INTO invitations (email, role_id, invited_by, invited_on) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [email, role_id, invited_by]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async markAsRegistered(email) {
        try {
            const result = await db.query(
                'UPDATE invitations SET registered = TRUE WHERE email = $1 RETURNING *',
                [email]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findAll() {
        try {
            const result = await db.query(`
                SELECT i.*, p.first_name, p.last_name 
                FROM invitations i
                LEFT JOIN participants p ON i.invited_by = p.id
                ORDER BY i.invited_on DESC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            await db.query('DELETE FROM invitations WHERE id = $1', [id]);
            return true;
        } catch (error) {
            throw error;
        }
    }
};

export default InvitationModel;