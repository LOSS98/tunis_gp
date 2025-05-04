import * as db from '../config/db.js';
import bcrypt from 'bcrypt';

const UserModel = {
    async findAll() {
        try {
            const result = await db.query(`
        SELECT u.id, u.name, u.email, u.profilePicture, u.phone, 
               u.last_connection, u.created_on, r.name as role 
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
        SELECT u.id, u.name, u.email, u.profilePicture, u.phone, 
               u.last_connection, u.created_on, r.name as role 
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
            name,
            email,
            password,
            profilePicture = null,
            phone = null,
            role_id = 3, // Default to 'volunteer' role
            created_by = null
        } = userData;

        try {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await db.query(`
        INSERT INTO users (
          name, 
          email, 
          password, 
          profilePicture, 
          phone, 
          role_id, 
          created_by,
          created_on
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
        RETURNING id, name, email, profilePicture, phone, role_id, created_on
      `, [name, email, hashedPassword, profilePicture, phone, role_id, created_by]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async update(id, userData) {
        const { name, email, phone, role_id, profilePicture } = userData;

        try {
            const result = await db.query(`
        UPDATE users 
        SET 
          name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          role_id = COALESCE($4, role_id),
          profilePicture = COALESCE($5, profilePicture)
        WHERE id = $6
        RETURNING id, name, email, profilePicture, phone, role_id
      `, [name, email, phone, role_id, profilePicture, id]);

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