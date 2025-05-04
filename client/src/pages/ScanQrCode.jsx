// ScanQrCode.jsx
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CountryFlag from '../components/CountryFlag';

const ScanQrCode = () => {
    const { currentUser } = useAuth();
    const [scanning, setScanning] = useState(true);
    const [scanError, setScanError] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showWaterForm, setShowWaterForm] = useState(false);
    const [bottlesCount, setBottlesCount] = useState(1);
    const [waterMessage, setWaterMessage] = useState('');
    const [html5QrCodeScanner, setHtml5QrCodeScanner] = useState(null);

    useEffect(() => {
        if (scanning) {
            // Créer l'instance de scanner
            const scanner = new Html5Qrcode("qr-reader");
            setHtml5QrCodeScanner(scanner);

            // Démarrer le scanner
            scanner.start(
                { facingMode: "environment" }, // Utiliser la caméra arrière
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Callback sur succès de scan
                    handleScan(decodedText);
                    scanner.stop().catch(err => {
                        console.error("Erreur lors de l'arrêt du scanner:", err);
                    });
                },
                (errorMessage) => {
                    // Les erreurs de scan sont fréquentes et normales pendant le scanning
                    console.log("Erreur de scan QR:", errorMessage);
                }
            ).catch(err => {
                setScanError(`Erreur d'accès à la caméra: ${err}`);
            });
        }

        // Nettoyer le scanner quand le composant est démonté
        return () => {
            if (html5QrCodeScanner) {
                html5QrCodeScanner.stop().catch(err => {
                    console.error("Erreur lors de l'arrêt du scanner:", err);
                });
            }
        };
    }, [scanning]);

    const handleScan = async (data) => {
        if (data) {
            setScanning(false);
            setLoading(true);

            try {
                // Extraire le token de l'URL du QR code
                let token = '';

                // Gérer différents formats d'URL
                if (data.includes('?token=')) {
                    // Format URL (ex: https://example.com/scan?token=abc123)
                    const urlParams = new URLSearchParams(new URL(data).search);
                    token = urlParams.get('token');
                } else if (data.includes('token:')) {
                    // Format texte (ex: token:abc123)
                    token = data.split('token:')[1].trim();
                } else {
                    // Considérer le texte entier comme token
                    token = data;
                }

                if (token) {
                    const response = await axios.get(`/api/auth/validate-qr/${token}`);
                    setScanResult(response.data);
                } else {
                    setScanError('Format de QR code invalide');
                }
            } catch (error) {
                setScanError(error.response?.data?.message || 'Erreur de scan du QR code');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetScan = () => {
        setScanResult(null);
        setScanError('');
        setWaterMessage('');
        setShowWaterForm(false);
        setScanning(true);
    };

    const handleAddWater = async () => {
        if (!scanResult?.participant?.bib) {
            setWaterMessage('Ce participant n\'a pas de numéro BIB');
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post('/api/water/add', {
                bib: scanResult.participant.bib,
                bottles_taken: parseInt(bottlesCount)
            });

            setWaterMessage(`${bottlesCount} bouteille(s) d'eau ajoutée(s) avec succès`);
            setShowWaterForm(false);
        } catch (error) {
            setWaterMessage(error.response?.data?.message || 'Erreur lors de l\'ajout des bouteilles d\'eau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="scan-qr-page">
            <h1>Scanner un QR Code</h1>

            {scanning ? (
                <div className="scanner-container">
                    <p>Veuillez scanner le QR code d'un participant</p>
                    <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                    {scanError && <div className="error-message">{scanError}</div>}
                </div>
            ) : (
                <div className="scan-result">
                    {loading ? (
                        <div>Chargement...</div>
                    ) : scanResult ? (
                        <>
                            <div className="participant-info">
                                <h2>Informations du Participant</h2>

                                {scanResult.participant.profilePicture && (
                                    <div className="profile-picture">
                                        <img
                                            src={scanResult.participant.profilePicture}
                                            alt="Photo de profil"
                                            className="participant-photo"
                                        />
                                    </div>
                                )}

                                <div className="info-details">
                                    <p><strong>Nom:</strong> {scanResult.participant.first_name} {scanResult.participant.last_name}</p>
                                    <p><strong>Rôle:</strong> {scanResult.participant.role}</p>

                                    {scanResult.participant.bib && (
                                        <p><strong>BIB:</strong> {scanResult.participant.bib}</p>
                                    )}

                                    {scanResult.participant.class && (
                                        <p><strong>Classe:</strong> {scanResult.participant.class}</p>
                                    )}

                                    {scanResult.participant.country && (
                                        <div className="country-info">
                                            <strong>Pays:</strong>
                                            <CountryFlag countryCode={scanResult.participant.country} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Afficher les événements à venir pour les athlètes */}
                            {scanResult.participant.role === 'athlete' && scanResult.events?.length > 0 && (
                                <div className="upcoming-events">
                                    <h3>Événements à venir</h3>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Heure</th>
                                            <th>Discipline</th>
                                            <th>Phase</th>
                                            <th>Zone</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {scanResult.events.map((event, index) => (
                                            <tr key={index}>
                                                <td>{new Date(event.start_day).toLocaleDateString()}</td>
                                                <td>{event.start_time}</td>
                                                <td>{event.discipline}</td>
                                                <td>{event.phase}</td>
                                                <td>{event.area || 'N/A'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Gestion des bouteilles d'eau - seulement pour les volontaires, LOC, admin */}
                            {['volunteer', 'loc', 'admin'].includes(currentUser?.user?.role) && (
                                <div className="water-management">
                                    {showWaterForm ? (
                                        <div className="water-form">
                                            <h3>Ajouter des bouteilles d'eau</h3>
                                            <div className="form-group">
                                                <label htmlFor="bottlesCount">Nombre de bouteilles:</label>
                                                <input
                                                    type="number"
                                                    id="bottlesCount"
                                                    min="1"
                                                    max="10"
                                                    value={bottlesCount}
                                                    onChange={(e) => setBottlesCount(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-buttons">
                                                <button
                                                    onClick={handleAddWater}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Traitement...' : 'Confirmer'}
                                                </button>
                                                <button
                                                    onClick={() => setShowWaterForm(false)}
                                                    className="cancel-button"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowWaterForm(true)}
                                            className="water-button"
                                        >
                                            Ajouter des bouteilles d'eau
                                        </button>
                                    )}

                                    {waterMessage && (
                                        <div className={waterMessage.includes('Erreur') ? 'error-message' : 'success-message'}>
                                            {waterMessage}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={resetScan}
                                className="scan-again-button"
                            >
                                Scanner un autre code
                            </button>
                        </>
                    ) : (
                        <div className="scan-error">
                            <p>{scanError || 'Erreur de scan du QR code'}</p>
                            <button
                                onClick={resetScan}
                                className="scan-again-button"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        .scan-qr-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .scanner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
        }
        
        #qr-reader {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 20px;
        }
        
        .participant-info {
          display: flex;
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          align-items: center;
        }
        
        .profile-picture {
          margin-right: 20px;
        }
        
        .participant-photo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .info-details {
          flex: 1;
        }
        
        .country-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 5px;
        }
        
        .upcoming-events {
          margin-bottom: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f2f2f2;
        }
        
        .water-management {
          margin: 20px 0;
          padding: 15px;
          background-color: #f0f8ff;
          border-radius: 8px;
        }
        
        .water-form {
          padding: 15px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-buttons {
          display: flex;
          gap: 10px;
        }
        
        button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .water-button {
          background-color: #4CAF50;
          color: white;
          width: 100%;
        }
        
        .cancel-button {
          background-color: #f44336;
          color: white;
        }
        
        .scan-again-button {
          background-color: #2196F3;
          color: white;
          width: 100%;
          margin-top: 20px;
        }
        
        .error-message {
          color: #f44336;
          margin: 10px 0;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
        }
        
        .success-message {
          color: #4CAF50;
          margin: 10px 0;
          padding: 10px;
          background-color: #e8f5e9;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
};

export default ScanQrCode;