// src/components/QRCodeDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const QRCodeDisplay = () => {
    const { generateQRCode } = useAuth();
    const [qrData, setQrData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        // Nettoyer l'intervalle à la fermeture du composant
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);

    const fetchQRCode = async () => {
        try {
            setLoading(true);
            setError('');

            const result = await generateQRCode();

            if (result.success) {
                // Créer l'URL pour le QR code
                const qrCodeUrl = `${window.location.origin}/scan?token=${result.data.token}`;

                // Générer l'image du QR code via l'API QR Server
                const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeUrl)}`;

                setQrData({
                    ...result.data,
                    qrImageUrl: qrCodeImageUrl
                });

                // Calculer le temps restant
                const validTill = new Date(result.data.valid_till);
                const now = new Date();
                const diffMs = validTill - now;
                const diffSec = Math.floor(diffMs / 1000);

                setTimeLeft(diffSec);

                // Nettoyer l'intervalle précédent
                if (intervalId) {
                    clearInterval(intervalId);
                }

                // Démarrer le compte à rebours
                const id = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(id);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                setIntervalId(id);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Erreur lors de la génération du QR code');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Actualiser automatiquement le QR code à l'expiration
    useEffect(() => {
        if (timeLeft === 0 && qrData) {
            fetchQRCode();
        }
    }, [timeLeft, qrData]);

    return (
        <div className="qrcode-container">
            <h2>Mon QR Code</h2>

            {error && <div className="error-message">{error}</div>}

            {qrData ? (
                <div className="qrcode-display">
                    <img
                        src={qrData.qrImageUrl}
                        alt="QR Code"
                        width={250}
                        height={250}
                    />
                    <div className="qrcode-info">
                        <p>Ce QR code est valide pendant <strong>{timeLeft}</strong> secondes</p>
                        <button
                            onClick={fetchQRCode}
                            disabled={loading}
                            className="refresh-button"
                        >
                            {loading ? 'Génération...' : 'Actualiser le QR Code'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="qrcode-generate">
                    <p>Générez un QR code pour vous identifier aux points de contrôle</p>
                    <button
                        onClick={fetchQRCode}
                        disabled={loading}
                        className="generate-button"
                    >
                        {loading ? 'Génération...' : 'Générer un QR Code'}
                    </button>
                </div>
            )}

            <div className="qrcode-instructions">
                <h3>Instructions:</h3>
                <ul>
                    <li>Ce QR code est valide pour 1 minute seulement</li>
                    <li>Le personnel peut scanner ce code pour vérifier votre identité</li>
                    <li>Si vous êtes un athlète, le personnel peut voir vos prochaines épreuves</li>
                    <li>Pour demander des bouteilles d'eau, veuillez présenter ce QR code à un volontaire</li>
                </ul>
            </div>
        </div>
    );
};

export default QRCodeDisplay;