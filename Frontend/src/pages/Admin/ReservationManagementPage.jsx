/**
 * ReservationManagementPage – Admin-Oberfläche zur Verwaltung von Reservierungen
 *
 * Funktionen
 * • Alle Reservierungen laden, Status ändern, löschen
 * • JWT-basierte Authentifizierung (x-auth-token)
 * • Inline-Statusbearbeitung via Dropdown
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ReservationManagementPage.css";

const API_BASE_URL = 'http://localhost:3001';

function ReservationManagementPage() {
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editReservationId, setEditReservationId] = useState(null); // ID der Reservierung, die bearbeitet wird
    const [editStatus, setEditStatus] = useState('');
    const navigate = useNavigate();

    const fetchReservations = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Als Admin ruft dieser Endpunkt alle Reservierungen ab (im Backend so implementiert)
            const response = await fetch(`${API_BASE_URL}/api/reservations`, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok) {
                setReservations(data);
            } else {
                setError(data.message || 'Reservierungen konnten nicht geladen werden.');
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                }
            }
        } catch (err) {
            setError('Netzwerkfehler beim Laden der Reservierungen.');
            console.error('Reservations fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm('Möchten Sie diese Reservierung wirklich löschen?')) {
            return;
        }
        setError('');
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                alert('Reservierung erfolgreich gelöscht!');
                fetchReservations(); // Liste neu laden
            } else {
                const data = await response.json();
                setError(data.message || 'Löschen fehlgeschlagen.');
            }
        } catch (err) {
            setError('Netzwerkfehler beim Löschen der Reservierung.');
            console.error('Delete reservation error:', err);
        }
    };

    const handleEditClick = (reservation) => {
        setEditReservationId(reservation.id);
        setEditStatus(reservation.status);
    };

    const handleCancelEdit = () => {
        setEditReservationId(null);
        setError('');
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/reservations/${editReservationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status: editStatus }), // Nur Status aktualisieren
            });

            const data = await response.json();

            if (response.ok) {
                alert('Reservierungsstatus erfolgreich aktualisiert!');
                handleCancelEdit();
                fetchReservations(); // Liste neu laden
            } else {
                setError(data.message || 'Statusaktualisierung fehlgeschlagen.');
            }
        } catch (err) {
            setError('Netzwerkfehler beim Aktualisieren des Status.');
            console.error('Update reservation status error:', err);
        }
    };


    if (loading) return <div className="content-container"><p>Reservierungen werden geladen...</p></div>;
    if (error && !editReservationId) return <div className="content-container error-message"><h2>Fehler:</h2><p>{error}</p></div>;

    return (
        <div className="content-container">
            <h2>Reservierungsverwaltung</h2>
            {error && <p className="error-message">{error}</p>}

            {/* Zurück-Button zum Dashboard */}
            <button
                onClick={() => navigate('/admin/dashboard')}
                style={{
                    marginBottom: '15px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                ← Zurück zum Dashboard
            </button>

            {reservations.length === 0 ? (
                <p>Keine Reservierungen gefunden.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={tableHeaderStyle}>ID</th>
                        <th style={tableHeaderStyle}>Benutzer</th>
                        <th style={tableHeaderStyle}>Fahrzeug</th>
                        <th style={tableHeaderStyle}>Startzeit</th>
                        <th style={tableHeaderStyle}>Endzeit</th>
                        <th style={tableHeaderStyle}>Kosten</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Aktionen</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reservations.map((res) => (
                        <tr key={res.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={tableCellStyle}>{res.id}</td>
                            <td style={tableCellStyle}>{res.User ? res.User.username : 'N/A'} ({res.User ? res.User.email : 'N/A'})</td>
                            <td style={tableCellStyle}>{res.Car ? `${res.Car.brand} ${res.Car.model} (${res.Car.licensePlate})` : 'N/A'}</td>
                            <td style={tableCellStyle}>{new Date(res.startTime).toLocaleString()}</td>
                            <td style={tableCellStyle}>{new Date(res.endTime).toLocaleString()}</td>
                            <td style={tableCellStyle}>{res.totalCost ? `${res.totalCost.toFixed(2)} €` : 'N/A'}</td>
                            <td style={tableCellStyle}>
                                {editReservationId === res.id ? (
                                    <form onSubmit={handleUpdateStatus} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={selectStyle}>
                                            <option value="pending">pending</option>
                                            <option value="confirmed">confirmed</option>
                                            <option value="completed">completed</option>
                                            <option value="cancelled">cancelled</option>
                                        </select>
                                        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '5px 10px', borderRadius: '5px', border: 'none' }}>✔</button>
                                        <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', borderRadius: '5px', border: 'none' }}>✖</button>
                                    </form>
                                ) : (
                                    res.status
                                )}
                            </td>
                            <td style={tableCellStyle}>
                                {editReservationId !== res.id && (
                                    <>
                                        <button onClick={() => handleEditClick(res)} style={{ backgroundColor: '#ffc107', color: 'black', padding: '5px 10px', borderRadius: '5px', border: 'none', marginRight: '5px' }}>Status ändern</button>
                                        <button onClick={() => handleDelete(res.id)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', borderRadius: '5px', border: 'none' }}>Löschen</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Inline-Styles für die Tabelle
const tableHeaderStyle = {
    padding: '12px 8px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
};

const tableCellStyle = {
    padding: '8px',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
};

const selectStyle = {
    padding: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
};

export default ReservationManagementPage;