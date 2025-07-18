/**
 * Benutzer‑Controller für MoveSmart
 *
 * Endpunkte
 * • GET    /api/users/me          – Eigenes Profil abrufen
 * • GET    /api/users             – Alle Nutzer (nur Admin)
 * • PATCH  /api/users/:id         – Nutzer aktualisieren
 * • DELETE /api/users/:id         – Nutzer löschen
 */
import User   from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Liefert das eigene Profil (ohne Passwort).
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden.' });

    res.json(user);
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Gibt alle Nutzer zurück (nur Admin).
 */
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen aller Nutzer:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Aktualisiert einen Nutzer.
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden.' });

    // Berechtigungs‑Checks
    if (req.user.role !== 'admin' && req.user.id !== +id)
      return res.status(403).json({ message: 'Keine Berechtigung, diesen Nutzer zu ändern.' });

    if (req.user.role !== 'admin' && role && role !== user.role)
      return res.status(403).json({ message: 'Rollenänderung nicht erlaubt.' });

    // Feld‑Updates
    user.username = username ?? user.username;
    user.email    = email    ?? user.email;
    if (req.user.role === 'admin' && role) user.role = role;

    await user.save();
    res.json({
      message: 'Benutzer erfolgreich aktualisiert.',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Nutzers:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Löscht einen Nutzer.
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden.' });

    if (req.user.role !== 'admin' && req.user.id !== +id)
      return res.status(403).json({ message: 'Keine Berechtigung, diesen Nutzer zu löschen.' });

    await user.destroy();
    res.json({ message: 'Benutzer erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Fehler beim Löschen des Nutzers:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};
