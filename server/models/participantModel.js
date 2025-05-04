// server/models/participantModel.js
import * as db from '../config/db.js';
import bcrypt from 'bcrypt';

const ParticipantModel = {
    async findAll() {
        try {
            const result = await db.query(`
                SELECT
                    p.id,
                    p.first_name,
                    p.last_name,
                    p.email,
                    p.bib,
                    p.country,
                    p.class,
                    p.created_on,
                    p.last_connection,
                    p.profilePicture,
                    r.name as role,
                    r.id as role_id
                FROM participants p
                         JOIN roles r ON p.role_id = r.id
                ORDER BY p.last_name, p.first_name
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        try {
            const result = await db.query(`
                SELECT
                    p.id,
                    p.first_name,
                    p.last_name,
                    p.email,
                    p.bib,
                    p.country,
                    p.class,
                    p.created_on,
                    p.last_connection,
                    p.profilePicture,
                    r.name as role,
                    r.id as role_id
                FROM participants p
                         JOIN roles r ON p.role_id = r.id
                WHERE p.id = $1
            `, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByEmail(email) {
        try {
            const result = await db.query(`
                SELECT * FROM participants
                WHERE email = $1
            `, [email]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByBib(bib) {
        try {
            const result = await db.query(`
                SELECT * FROM participants
                WHERE bib = $1
            `, [bib]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async create(participantData) {
        const {
            bib,
            firstName,
            lastName,
            email,
            password,
            country,
            class: participantClass,
            role_id,
            created_by
        } = participantData;

        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await db.query(`
                INSERT INTO participants (
                    bib,
                    first_name,
                    last_name,
                    email,
                    password,
                    country,
                    class,
                    role_id,
                    created_by,
                    created_on
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                RETURNING *
            `, [
                bib,
                firstName,
                lastName,
                email,
                hashedPassword,
                country,
                participantClass,
                role_id,
                created_by
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async update(id, participantData) {
        const {
            firstName,
            lastName,
            email,
            bib,
            country,
            class: participantClass,
            role_id,
            profilePicture
        } = participantData;

        try {
            const result = await db.query(`
                UPDATE participants
                SET
                    first_name = COALESCE($1, first_name),
                    last_name = COALESCE($2, last_name),
                    email = COALESCE($3, email),
                    bib = COALESCE($4, bib),
                    country = COALESCE($5, country),
                    class = COALESCE($6, class),
                    role_id = COALESCE($7, role_id),
                    profilePicture = COALESCE($8, profilePicture)
                WHERE id = $9
                    RETURNING *
            `, [
                firstName,
                lastName,
                email,
                bib,
                country,
                participantClass,
                role_id,
                profilePicture,
                id
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async updatePassword(id, password) {
        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await db.query(`
                UPDATE participants
                SET password = $1
                WHERE id = $2
                RETURNING *
            `, [hashedPassword, id]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async updateLastConnection(id) {
        try {
            await db.query(`
                UPDATE participants
                SET last_connection = NOW()
                WHERE id = $1
            `, [id]);
            return true;
        } catch (error) {
            throw error;
        }
    },

    async getParticipantsByRole(roleId) {
        try {
            const result = await db.query(`
                SELECT 
                    p.id, 
                    p.first_name, 
                    p.last_name, 
                    p.email, 
                    p.bib, 
                    p.country, 
                    p.class, 
                    p.created_on,
                    r.name as role
                FROM participants p
                JOIN roles r ON p.role_id = r.id
                WHERE p.role_id = $1
                ORDER BY p.last_name, p.first_name
            `, [roleId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async getParticipantsByCountry(country) {
        try {
            const result = await db.query(`
                SELECT 
                    p.id, 
                    p.first_name, 
                    p.last_name, 
                    p.email, 
                    p.bib, 
                    p.country, 
                    p.class, 
                    p.created_on,
                    r.name as role
                FROM participants p
                JOIN roles r ON p.role_id = r.id
                WHERE p.country = $1
                ORDER BY p.last_name, p.first_name
            `, [country]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async getRoleById(roleId) {
        try {
            const result = await db.query(`
                SELECT * FROM roles
                WHERE id = $1
            `, [roleId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async getAllRoles() {
        try {
            const result = await db.query(`
                SELECT * FROM roles
                ORDER BY id
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
};

export default ParticipantModel;