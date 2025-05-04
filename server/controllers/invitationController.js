// server/controllers/invitationController.js
import * as db from '../config/db.js';
import InvitationModel from '../models/invitationModel.js';

const InvitationController = {
    async createInvitation(req, res) {
        try {
            const { email, role_id } = req.body;

            if (!email || !role_id) {
                return res.status(400).json({ message: 'Email et rôle sont requis' });
            }

            // Vérifier si l'email est déjà invité
            const existingInvitation = await InvitationModel.findByEmail(email);

            if (existingInvitation) {
                return res.status(400).json({ message: 'Cet email a déjà été invité' });
            }

            // Créer l'invitation
            const invitation = await InvitationModel.create({
                email,
                role_id,
                invited_by: req.user.userId
            });

            // TODO: Envoyer un email d'invitation

            res.status(201).json({
                message: 'Invitation créée avec succès',
                invitation
            });
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },

    async getAllInvitations(req, res) {
        try {
            const invitations = await InvitationModel.findAll();
            res.status(200).json(invitations);
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },

    async deleteInvitation(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID de l\'invitation requis' });
            }

            await InvitationModel.delete(id);

            res.status(200).json({ message: 'Invitation supprimée avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    }
};

export default InvitationController;