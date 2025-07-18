import React from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import "./App.css"; // Stellt sicher, dass diese Datei existiert oder entfernt den Import

import logoImg from "./assets/movesmart-logo.png";

// Imports der ausgelagerten Komponenten - KORRIGIERTE PFADE
import LoginPage from "./pages/Auth/LoginPage"; // Hinzufügen von './'
import RegisterWizard from './pages/Auth/Register/RegisterWizard.jsx'; // Hinzufügen von './'
import HomePage from "./pages/User/HomePage.jsx"; // Hinzufügen von './'
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/User/ProfilePage.jsx"; // Hinzufügen von './'
import ReservationsPage from "./pages/User/ReservationsPage.jsx"; // Hinzufügen von './'
import NewReservationPage from "./pages/User/NewReservationPage.jsx"; // WIEDERHERGESTELLT
import EditReservationPage from "./pages/User/EditReservationPage.jsx"; // NEU für Bearbeitung
import AboutUsPage from "./pages/User/AboutUsPage.jsx"; // Hinzufügen von './'
import RatesPage from "./pages/User/RatesPage.jsx"; // Hinzufügen von './'

// Import der PrivateRoute Komponente - KORRIGIERTER PFAD
import PrivateRoute from "./components/PrivateRoute"; // Hinzufügen von './'

// Import des Auth Hooks - KORRIGIERTER PFAD
import useAuth from "./hooks/useAuth";
import AboutUs from "./pages/User/AboutUsPage.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboardPage.jsx";
import ReservationManagementPage from "./pages/Admin/ReservationManagementPage.jsx";
import CreateStaffPage from "./pages/Admin/CreateStaffPage.jsx";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage.jsx";
import CarManagementPage from "./pages/Admin/CarManagementPage.jsx";
import UserManagementPage from "./pages/Admin/UserManagementPage.jsx"; // Hinzufügen von './'
// import CreateUserByAdminPage from "./pages/Admin/CreateUserByAdminPage.jsx"; // ENTFERNT
// --- Hauptkomponente der React-Anwendung ---
function App() {
  const { token,userRole, login, logout } = useAuth(); // Nutzung des Custom Hooks

  const navigate = useNavigate();

  return (
    <div className="App">
<nav className="navbar flex items-center justify-between px-6 py-4 shadow relative z-50">
  {/* Brand: Logo + Text */}
  <NavLink to="/" className="flex items-center gap-2">
    <img src={logoImg} alt="MoveSmart Logo" className="h-8 w-auto" />
    <span className="text-xl font-extrabold bg-gradient-to-r from-brand-start
                                     via-brand-mid to-brand-end bg-clip-text text-transparent drop-shadow">
  MoveSmart
</span>

  </NavLink>

  {/* Rechts: alle Navigationslinks */}
  <div className="navbar-links flex gap-6 items-center">
    {token ? (
      <>
        <NavLink to="/home">Fahrzeuge</NavLink>
        <NavLink to="/profile">Profil</NavLink>
        <NavLink to="/reservations">Reservierungen</NavLink>
        <NavLink to="/aboutus">Über&nbsp;Uns</NavLink>
        <NavLink to="/rates">Tarife</NavLink>

        {userRole === "admin" && (
          <NavLink to="/admin/dashboard">Admin-Dashboard</NavLink>
        )}
          {userRole === "staff" && (
              <NavLink to="/mitarbeiter/dashboard">Mitarbeiter-Dashboard</NavLink>
          )}

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="nav-button"
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/rates">Tarife</NavLink>
        <NavLink to="/aboutus">Über&nbsp;Uns</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Registrieren</NavLink>
      </>
    )}
  </div>
</nav>

      <main>
        <Routes>

  {/* Öffentliche Seiten */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/aboutus" element={<AboutUsPage />} />
  <Route path="/login" element={<LoginPage onLoginSuccess={login} />} />
  <Route path="/register/*" element={<RegisterWizard />} />
  <Route path="/rates" element={<RatesPage />} />

  {/* Geschützte Nutzer-Routen */}
  <Route
    path="/home"
    element={
      <PrivateRoute>
        <HomePage />
      </PrivateRoute>
    }
  />
  <Route
    path="/profile"
    element={
      <PrivateRoute>
        <ProfilePage />
      </PrivateRoute>
    }
  />
  <Route
    path="/reservations"
    element={
      <PrivateRoute>
        <ReservationsPage />
      </PrivateRoute>
    }
  />

  {/* Geschützte Admin-Routen (Role-Check inside <PrivateRoute requiredRole="admin" />) */}
  <Route
    path="/admin/dashboard"
    element={
      <PrivateRoute requiredRole="admin">
        <AdminDashboardPage />
      </PrivateRoute>
    }
  />
  <Route
    path="/admin/cars"
    element={
      <PrivateRoute requiredRole="admin">
        <CarManagementPage />
      </PrivateRoute>
    }
  />
  <Route
    path="/admin/users"
    element={
      <PrivateRoute requiredRole="admin">
        <UserManagementPage />
      </PrivateRoute>
    }
  />
  <Route
    path="/admin/create-staff"
    element={
      <PrivateRoute requiredRole="admin">
        <CreateStaffPage />
      </PrivateRoute>
    }
  />
  <Route
    path="/admin/reservations"
    element={
      <PrivateRoute requiredRole="admin">
        <ReservationManagementPage />
      </PrivateRoute>
    }
  />
  {/* Die Route /admin/create-user wurde entfernt
  <Route
    path="/admin/create-user"
    element={
      <PrivateRoute requiredRole="admin">
        <CreateUserByAdminPage />
      </PrivateRoute>
    }
  />
  */}

  {/* Reservierung per ID – nur eingeloggt - ROUTE WIEDERHERGESTELLT */}
  <Route
    path="/new-reservation/:id"
    element={
      <PrivateRoute>
        <NewReservationPage />
      </PrivateRoute>
    }
  />
  <Route
    path="/edit-reservation/:id" // NEUE ROUTE für Bearbeitung
    element={
      <PrivateRoute>
        <EditReservationPage />
      </PrivateRoute>
    }
  />

  {/* Fallback für unbekannte Pfade */}
  <Route path="*" element={<h2 className="content-container">404 – Seite nicht gefunden</h2>} />
</Routes>
      </main>
    </div>
  );
}

export default App;