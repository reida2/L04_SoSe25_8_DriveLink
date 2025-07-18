/**
 * CarManagementPage – Admin-Oberfläche zur Fahrzeugverwaltung
 *
 * Funktionen:
 * • Liste aller Fahrzeuge laden / anzeigen
 * • Fahrzeuge anlegen, bearbeiten, löschen
 * • Inline‑Bearbeitung mit Formularen; Erstellungsformular oben
 * • Authentifizierung via JWT (x-auth-token)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001';

function CarManagementPage() {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editCarId, setEditCarId] = useState(null); // ID des Autos, das gerade bearbeitet wird

    // States für Bearbeitungsformular
    const [editLicensePlate, setEditLicensePlate] = useState('');
    const [editBrand, setEditBrand] = useState('');
    const [editModel, setEditModel] = useState('');
    const [editYear, setEditYear] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editDailyRate, setEditDailyRate] = useState('');
    const [editIsAvailable, setEditIsAvailable] = useState(true);

    // States für Erstellungsformular
    const [newLicensePlate, setNewLicensePlate] = useState('');
    const [newBrand, setNewBrand] = useState('');
    const [newModel, setNewModel] = useState('');
    const [newYear, setNewYear] = useState('');
    const [newColor, setNewColor] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newDailyRate, setNewDailyRate] = useState('');
    const [newIsAvailable, setNewIsAvailable] = useState(true);


    const navigate = useNavigate();

    const fetchCars = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cars`, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok) {
                setCars(data);
            } else {
                setError(data.message || 'Fahrzeuge konnten nicht geladen werden.');
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                }
            }
        } catch (err) {
            setError('Netzwerkfehler beim Laden der Fahrzeuge.');
            console.error('Cars fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm('Möchten Sie dieses Fahrzeug wirklich löschen?')) {
            return;
        }
        setError('');
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                alert('Fahrzeug erfolgreich gelöscht!');
                fetchCars(); // Liste neu laden
            } else {
                const data = await response.json();
                setError(data.message || 'Löschen fehlgeschlagen.');
            }
        } catch (err) {
            setError('Netzwerkfehler beim Löschen des Fahrzeugs.');
            console.error('Delete car error:', err);
        }
    };

    const handleCreateCar = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        if (!newLicensePlate || !newBrand || !newModel || !newYear || !newLocation || !newDailyRate) {
            setError('Bitte alle Pflichtfelder für das neue Fahrzeug ausfüllen.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cars`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    licensePlate: newLicensePlate,
                    brand: newBrand,
                    model: newModel,
                    year: parseInt(newYear),
                    color: newColor,
                    location: newLocation,
                    dailyRate: parseFloat(newDailyRate),
                    isAvailable: newIsAvailable
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Fahrzeug erfolgreich erstellt!');
                // Formularfelder zurücksetzen
                setNewLicensePlate('');
                setNewBrand('');
                setNewModel('');
                setNewYear('');
                setNewColor('');
                setNewLocation('');
                setNewDailyRate('');
                setNewIsAvailable(true);
                fetchCars(); // Liste neu laden
            } else {
                setError(data.message || 'Erstellung des Fahrzeugs fehlgeschlagen.');
            }
        } catch (err) {
            setError('Netzwerkfehler beim Erstellen des Fahrzeugs.');
            console.error('Create car error:', err);
        }
    };

    const handleEditClick = (car) => {
        setEditCarId(car.id);
        setEditLicensePlate(car.licensePlate);
        setEditBrand(car.brand);
        setEditModel(car.model);
        setEditYear(car.year.toString()); // Muss String sein für Input
        setEditColor(car.color || '');
        setEditLocation(car.location);
        setEditDailyRate(car.dailyRate.toString()); // Muss String sein für Input
        setEditIsAvailable(car.isAvailable);
    };

    const handleCancelEdit = () => {
        setEditCarId(null);
        setError('');
    };

    const handleUpdateCar = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        if (!editLicensePlate || !editBrand || !editModel || !editYear || !editLocation || !editDailyRate) {
            setError('Bitte alle Pflichtfelder für die Bearbeitung ausfüllen.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cars/${editCarId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    licensePlate: editLicensePlate,
                    brand: editBrand,
                    model: editModel,
                    year: parseInt(editYear),
                    color: editColor,
                    location: editLocation,
                    dailyRate: parseFloat(editDailyRate),
                    isAvailable: editIsAvailable
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Fahrzeug erfolgreich aktualisiert!');
                handleCancelEdit();
                fetchCars(); // Liste neu laden
            } else {
                setError(data.message || 'Aktualisierung fehlgeschlagen.');
            }
        } catch (err) {
            setError('Netzwerkfehler beim Aktualisieren des Fahrzeugs.');
            console.error('Update car error:', err);
        }
    };


    if (loading) return <div className="content-container"><p>Fahrzeuge werden geladen...</p></div>;
    if (error && !editCarId) return <div className="content-container error-message"><h2>Fehler:</h2><p>{error}</p></div>;

    return (
        <div className="content-container">
            <h2>Fahrzeugverwaltung</h2>
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

            {/* Formular zum Erstellen eines neuen Fahrzeugs */}
            <h3>Neues Fahrzeug hinzufügen</h3>
            <form onSubmit={handleCreateCar} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <div className="form-group">
                    <label htmlFor="newLicensePlate">Kennzeichen:</label>
                    <input type="text" id="newLicensePlate" value={newLicensePlate} onChange={(e) => setNewLicensePlate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="newBrand">Marke:</label>
                    <input type="text" id="newBrand" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="newModel">Modell:</label>
                    <input type="text" id="newModel" value={newModel} onChange={(e) => setNewModel(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="newYear">Baujahr:</label>
                    <input type="number" id="newYear" value={newYear} onChange={(e) => setNewYear(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="newColor">Farbe:</label>
                    <input type="text" id="newColor" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="newLocation">Standort:</label>
                    <input type="text" id="newLocation" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="newDailyRate">Tagespreis (€):</label>
                    <input type="number" id="newDailyRate" value={newDailyRate} onChange={(e) => setNewDailyRate(e.target.value)} step="0.01" required />
                </div>
                <div className="form-group">
                    <input type="checkbox" id="newIsAvailable" checked={newIsAvailable} onChange={(e) => setNewIsAvailable(e.target.checked)} />
                    <label htmlFor="newIsAvailable" style={{ marginLeft: '5px' }}>Verfügbar</label>
                </div>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none' }}>Fahrzeug erstellen</button>
            </form>

            <h3>Alle Fahrzeuge</h3>
            {cars.length === 0 ? (
                <p>Keine Fahrzeuge gefunden.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={tableHeaderStyle}>ID</th>
                        <th style={tableHeaderStyle}>Kennzeichen</th>
                        <th style={tableHeaderStyle}>Marke</th>
                        <th style={tableHeaderStyle}>Modell</th>
                        <th style={tableHeaderStyle}>Jahr</th>
                        <th style={tableHeaderStyle}>Farbe</th>
                        <th style={tableHeaderStyle}>Standort</th>
                        <th style={tableHeaderStyle}>Preis (€)</th>
                        <th style={tableHeaderStyle}>Verfügbar</th>
                        <th style={tableHeaderStyle}>Aktionen</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cars.map((car) => (
                        <tr key={car.id} style={{ borderBottom: '1px solid #ddd' }}>
                            {editCarId === car.id ? (
                                // Bearbeitungsmodus
                                <td colSpan="10">
                                    <form onSubmit={handleUpdateCar} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', padding: '10px 0' }}>
                                        <input type="text" value={editLicensePlate} onChange={(e) => setEditLicensePlate(e.target.value)} required style={inputStyle} placeholder="Kennzeichen" />
                                        <input type="text" value={editBrand} onChange={(e) => setEditBrand(e.target.value)} required style={inputStyle} placeholder="Marke" />
                                        <input type="text" value={editModel} onChange={(e) => setEditModel(e.target.value)} required style={inputStyle} placeholder="Modell" />
                                        <input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} required style={inputStyle} placeholder="Baujahr" />
                                        <input type="text" value={editColor} onChange={(e) => setEditColor(e.target.value)} style={inputStyle} placeholder="Farbe" />
                                        <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} required style={inputStyle} placeholder="Standort" />
                                        <input type="number" value={editDailyRate} onChange={(e) => setEditDailyRate(e.target.value)} step="0.01" required style={inputStyle} placeholder="Tagespreis" />
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <input type="checkbox" id={`editIsAvailable-${car.id}`} checked={editIsAvailable} onChange={(e) => setEditIsAvailable(e.target.checked)} />
                                            <label htmlFor={`editIsAvailable-${car.id}`} style={{ marginLeft: '5px' }}>Verfügbar</label>
                                        </div>
                                        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 12px', borderRadius: '5px', border: 'none' }}>Speichern</button>
                                        <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 12px', borderRadius: '5px', border: 'none' }}>Abbrechen</button>
                                    </form>
                                </td>
                            ) : (
                                // Anzeigemodus
                                <>
                                    <td style={tableCellStyle}>{car.id}</td>
                                    <td style={tableCellStyle}>{car.licensePlate}</td>
                                    <td style={tableCellStyle}>{car.brand}</td>
                                    <td style={tableCellStyle}>{car.model}</td>
                                    <td style={tableCellStyle}>{car.year}</td>
                                    <td style={tableCellStyle}>{car.color}</td>
                                    <td style={tableCellStyle}>{car.location}</td>
                                    <td style={tableCellStyle}>{car.dailyRate.toFixed(2)} €</td>
                                    <td style={tableCellStyle}>{car.isAvailable ? 'Ja' : 'Nein'}</td>
                                    <td style={tableCellStyle}>
                                        <button onClick={() => handleEditClick(car)} style={{ backgroundColor: '#ffc107', color: 'black', padding: '5px 10px', borderRadius: '5px', border: 'none', marginRight: '5px' }}>Bearbeiten</button>
                                        <button onClick={() => handleDelete(car.id)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', borderRadius: '5px', border: 'none' }}>Löschen</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Inline-Styles für die Tabelle (könnten auch in CSS-Datei ausgelagert werden)
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

const inputStyle = {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    flex: '1',
    minWidth: '100px', // Damit Felder nicht zu klein werden
};

export default CarManagementPage;
