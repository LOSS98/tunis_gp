// Dans un nouveau fichier server/controllers/invitationController.js
import * as db from '../config/db.js';

const InvitationController = {
    async createInvitation(req, res) {
        try {
            const { email, role_id } = req.body;

            // Vérifier si l'email est déjà invité
            const existingInvitation = await db.query(
                'SELECT * FROM invitations WHERE email = $1',
                [email]
            );

            if (existingInvitation.rows.length > 0) {
                return res.status(400).json({ message: 'Cet email a déjà été invité' });
            }

            // Créer l'invitation
            const result = await db.query(
                'INSERT INTO invitations (email, role_id, invited_by) VALUES ($1, $2, $3) RETURNING *',
                [email, role_id, req.user.userId]
            );

            // TODO: Envoyer un email d'invitation

            res.status(201).json({
                message: 'Invitation créée avec succès',
                invitation: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },

    async getAllInvitations(req, res) {
        try {
            const result = await db.query(
                `SELECT i.*, p.first_name, p.last_name 
                FROM invitations i
                LEFT JOIN participants p ON i.invited_by = p.id
                ORDER BY i.invited_on DESC`
            );

            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },

    async deleteInvitation(req, res) {
        try {
            const { id } = req.params;

            await db.query('DELETE FROM invitations WHERE id = $1', [id]);

            res.status(200).json({ message: 'Invitation supprimée avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    }
};

export default InvitationController;