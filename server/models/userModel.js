import * as db from '../config/db.js';
import bcrypt from 'bcrypt';

const UserModel = {
    async findAll() {
        try {
            const result = await db.query(`
                SELECT u.id, u.first_name, u.last_name, u.email, u.profilePicture, u.phone,
                       u.country, u.last_connection, u.created_on, r.name as role
                FROM users u
                         JOIN roles r ON u.role_id = r.id
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        try {
            const result = await db.query(`
                SELECT u.id, u.first_name, u.last_name, u.email, u.profilePicture, u.phone,
                       u.country, u.last_connection, u.created_on, r.name as role
                FROM users u
                         JOIN roles r ON u.role_id = r.id
                WHERE u.id = $1
            `, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByEmail(email) {
        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async create(userData) {
        const {
            firstName,
            lastName,
            email,
            password,
            profilePicture = null,
            phone = null,
            country = null,
            role_id = 3, // Default to 'volunteer' role
            created_by = null
        } = userData;

        try {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await db.query(`
                INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password,
                    profilePicture,
                    phone,
                    country,
                    role_id,
                    created_by,
                    created_on
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    RETURNING id, first_name, last_name, email, profilePicture, phone, country, role_id, created_on
            `, [firstName, lastName, email, hashedPassword, profilePicture, phone, country, role_id, created_by]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async update(id, userData) {
        const { firstName, lastName, email, phone, country, role_id, profilePicture } = userData;

        try {
            const result = await db.query(`
                UPDATE users
                SET
                    first_name = COALESCE($1, first_name),
                    last_name = COALESCE($2, last_name),
                    email = COALESCE($3, email),
                    phone = COALESCE($4, phone),
                    country = COALESCE($5, country),
                    role_id = COALESCE($6, role_id),
                    profilePicture = COALESCE($7, profilePicture)
                WHERE id = $8
                    RETURNING id, first_name, last_name, email, profilePicture, phone, country, role_id
            `, [firstName, lastName, email, phone, country, role_id, profilePicture, id]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async updateLastConnection(userId) {
        try {
            await db.query(`
                UPDATE users
                SET last_connection = NOW()
                WHERE id = $1
            `, [userId]);

            return true;
        } catch (error) {
            throw error;
        }
    },

    async getRoleById(roleId) {
        try {
            const result = await db.query('SELECT * FROM roles WHERE id = $1', [roleId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async getAllRoles() {
        try {
            const result = await db.query('SELECT * FROM roles');
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
};

export default UserModel;