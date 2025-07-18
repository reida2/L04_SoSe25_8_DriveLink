/**
 * React‑Hook: useAuth
 *
 * Kümmert sich um
 * • Token‑Speicherung in localStorage
 * • Dekodieren des JWT, um die Rolle auszulesen
 * • login / logout Helferfunktionen
 */
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const [token, setToken]     = useState(localStorage.getItem('authToken'));
  const [userRole, setRole]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Token auswerten, sobald es sich ändert
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded?.user?.role ?? null);
      } catch {
        setRole(null);
      }
    } else {
      setRole(null);
    }
    setLoading(false);
  }, [token]);

  /** Speichert neues Token und Rolle */
  const login = newToken => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  /** Löscht Token und Rolle */
  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('authToken');
  };

  return { token, userRole, loading, login, logout };
};

export default useAuth;
