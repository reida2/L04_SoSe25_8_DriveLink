/**
 * AdminDashboard – Übersichtsseite für Admin‑Aktionen
 *
 * Zeigt Links zu Unterseiten für User‑, Mitarbeiter‑, Fahrzeug‑ und
 * Reservierungsverwaltung. Alle Links setzen voraus, dass der Nutzer bereits
 * per Route‑Guard als Admin authentifiziert ist.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import "./AdminDashboardPage.css";

function AdminDashboard() {
    return (
        <div className="content-container admin-dashboard">
            <h2>Admin Dashboard</h2>
            <p>Willkommen im Administrationsbereich. Wählen Sie eine Option zur Verwaltung:</p>

            <ul className="dashboard-cards">
                <li className="dashboard-card">
                    <Link to="/admin/users" className="dashboard-link user-link">
                        Benutzer verwalten
                    </Link>
                </li>
                <li className="dashboard-card">
                    <Link to="/admin/create-staff" className="dashboard-link staff-link"> {/* Pfad korrigiert zu create-staff */}
                        Mitarbeiter erstellen
                    </Link>
                </li>
                {/* Link zur Benutzererstellung wurde entfernt und zur UserManagementPage verschoben */}
                <li className="dashboard-card">
                    <Link to="/admin/cars" className="dashboard-link car-link">
                        Fahrzeuge verwalten
                    </Link>
                </li>
                <li className="dashboard-card">
                    <Link to="/admin/reservations" className="dashboard-link reservation-link">
                        Reservierungen verwalten
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default AdminDashboard;