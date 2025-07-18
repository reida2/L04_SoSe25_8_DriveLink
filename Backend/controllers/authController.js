/**
 * Authentifizierungs‑Controller für MoveSmart
 *
 * Endpunkte
 * 
 * • POST /api/auth/register           – Registrierung regulärer Nutzer
 * • POST /api/admin/staff/register    – Registrierung von Mitarbeitenden (Admin‑geschützt)
 * • POST /api/auth/login              – Benutzer‑Login
 *
 * Bibliotheken
 * • bcryptjs         – sicheres Hashen von Passwörtern
 * • jsonwebtoken     – Ausstellen von JWTs
 * • Sequelize‑Model  – User (Datenbankzugriff)
 */
import bcrypt   from 'bcryptjs';
import jwt      from 'jsonwebtoken';
import path     from 'path';
import User     from '../models/User.js';

/*
 * POST /api/auth/register
 * Registriert einen neuen Endkunden samt Führerschein‑ und Zahlungsdaten.
 */
export const register = async (req, res) => {
  try {
    // 1) Daten aus dem Request‑Body auslesen
    const {
      username, email, password,                       // Konto­daten
      licenseNo, licenseIssue, licenseExpiry,          // Führerschein
      payType, iban, bic, cardNo, cardExp, cardCvc     // Zahlungs­daten
    } = req.body;

    // Lizenzbilder (nur Vorderseite ist Pflicht)
    const frontFile = req.files?.licenseFront?.[0];
    const backFile  = req.files?.licenseBack?.[0];

    if (!frontFile)
      return res.status(400).json({ message: 'Das vordere Führerschein‑Foto ist Pflicht.' });

    // 2) E‑Mail darf nicht bereits existieren
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'E‑Mail existiert bereits.' });

    // 3) Passwort hashen
    const hash = await bcrypt.hash(password, 10);

    // 4) Benutzer anlegen
    user = await User.create({
      username,
      email,
      password         : hash,
      role             : 'user',
      // Führerschein
      licenseNo,
      licenseIssue,
      licenseExpiry,
      licenseFrontPath : frontFile.filename,
      licenseBackPath  : backFile ? backFile.filename : null,
      // Zahlungsdaten (abhängig von payType)
      payType,
      iban, bic,
      cardNo, cardExp, cardCvc
    });

    // 5) JWT ausstellen und Antwort schicken
    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ message: 'Registrierung erfolgreich', token });
    });
  } catch (err) {
    console.error('Fehler bei der Registrierung:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/*
 * POST /api/admin/staff/register
 * Legt einen neuen Mitarbeiter‑Account an (nur für Admins erreichbar).
 */
export const registerStaff = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: 'Benutzername, E‑Mail und Passwort sind erforderlich.' });

    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'E‑Mail existiert bereits.' });

    const hash = await bcrypt.hash(password, 10);

    user = await User.create({
      username,
      email,
      password : hash,
      role     : 'mitarbeiter',
    });

    res.status(201).json({ message: 'Mitarbeiter erfolgreich registriert', userId: user.id });
  } catch (err) {
    console.error('Fehler bei der Mitarbeiter‑Registrierung:', err);

    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validierungsfehler',
        errors : err.errors.map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/*
 * POST /api/auth/login
 * Authentifiziert einen Benutzer und gibt ein JWT zurück.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Ungültige Zugangsdaten' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Ungültige Zugangsdaten' });

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ message: 'Erfolgreich eingeloggt', token });
    });
  } catch (err) {
    console.error('Login‑Fehler:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
};
