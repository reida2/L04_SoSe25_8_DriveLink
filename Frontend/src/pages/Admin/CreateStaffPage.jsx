/**
 * CreateStaffPage – Admin‑Formular, um einen neuen Mitarbeiter anzulegen.
 *
 * Holt das JWT aus localStorage, sendet POST an /api/admin/staff/register und
 * navigiert nach Erfolg zur User‑Übersicht.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../services/api'; // Importiere die API-Basis-URL

// const API_BASE_URL = 'http://localhost:3001'; // Entfernt, da jetzt importiert

function CreateStaffPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password) {
            setError('Bitte alle Felder ausfüllen.');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Korrigierter API Endpunkt, um mit dem Backend übereinzustimmen
            const response = await fetch(`${API_BASE_URL}/api/admin/staff/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token, // Token wird jetzt korrekt aus der Variable geholt
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                // Versuche, JSON-Fehlermeldung zu parsen, falls vorhanden
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    // Antwort war kein valides JSON
                    setError(`Fehler beim Erstellen (Status: ${response.status}). Serverantwort nicht lesbar.`);
                    console.error('Server response not JSON:', response);
                    return;
                }
                setError(errorData.message || `Fehler beim Erstellen (Status: ${response.status}).`);
                return;
            }

            // Nur wenn response.ok, versuchen wir, JSON zu parsen (obwohl die Erfolgsantwort auch JSON sein sollte)
            const data = await response.json(); // Sollte hier sicher sein, wenn response.ok
            alert(data.message || 'Mitarbeiter erfolgreich erstellt!');
            navigate('/admin/users');

        } catch (err) {
            // Echter Netzwerkfehler (Server nicht erreichbar etc.)
            setError('Netzwerkfehler beim Erstellen. Bitte Serververbindung prüfen.');
            console.error('Network or parsing error:', err);
        }
    };

    return (
        <div className="content-container">
            <h2>Mitarbeiter erstellen</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="staff-form">
                <div className="form-group">
                    <label>Benutzername:</label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} required/>
                </div>
                <div className="form-group">
                    <label>E-Mail:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div className="form-group">
                    <label>Passwort:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <button type="submit">Erstellen</button>
            </form>
        </div>
    );
}

export default CreateStaffPage;