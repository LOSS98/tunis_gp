import UserModel from '../models/userModel.js';

const UserController = {
    async getAllUsers(req, res) {
        try {
            const users = await UserModel.findAll();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const user = await UserModel.findById(id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { name, email, phone, role_id, profilePicture } = req.body;

            // Check if user exists
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Only admins can update another user's role
            if (role_id && req.user.role !== 'admin' && id !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized to change role' });
            }

            // Update user
            const updatedUser = await UserModel.update(id, {
                name,
                email,
                phone,
                role_id,
                profilePicture
            });

            res.status(200).json({
                message: 'User updated successfully',
                user: updatedUser
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

export default UserController;