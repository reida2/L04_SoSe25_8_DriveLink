/**
 * Mitarbeiter‑Controller für MoveSmart
 *
 * Enthält Aktionen, die Mitarbeitende (und Admins) ausführen dürfen,
 * aber für reguläre Nutzer gesperrt sind.
 *
 * Endpunkte (Beispiele)
 * 
 * • PUT    /api/staff/users/:id            – Benutzerdaten ändern
 * • GET    /api/staff/users/:userId/res    – Reservierungen eines Nutzers
 * • PATCH  /api/staff/reservations/:id     – Reservierungsstatus ändern
 * • PATCH  /api/staff/cars/:id             – Fahrzeugdaten ändern
 * • POST   /api/staff/rates                – Tarif anlegen
 * • DELETE /api/staff/rates/:id            – Tarif löschen
 */
import User        from '../models/User.js';
import Car         from '../models/Car.js';
import Reservation from '../models/Reservation.js';
import Rate        from '../models/Rates.js';
import { Op }      from 'sequelize';
import bcrypt      from 'bcryptjs';

/**
 * Aktualisiert Username oder E‑Mail eines Nutzers.
 * Mitarbeitende dürfen weder Rolle noch Tarif ändern.
 */
export const updateUserDataByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden.' });

    user.username = username ?? user.username;
    user.email    = email    ?? user.email;

    await user.save();
    res.json({ message: 'Benutzerdaten erfolgreich aktualisiert.', user });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Benutzerdaten:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Gibt alle Reservierungen eines bestimmten Nutzers aus.
 */
export const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.findAll({
      where: { userId },
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Car,  attributes: ['id', 'brand', 'model', 'licensePlate'] },
      ]
    });
    res.json(reservations);
  } catch (error) {
    console.error('Fehler beim Abrufen der Reservierungen:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Ändert den Status einer Reservierung.
 */
export const updateReservationStatusByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) return res.status(404).json({ message: 'Reservierung nicht gefunden.' });

    if (status) reservation.status = status;

    await reservation.save();
    res.json({ message: 'Reservierungsstatus aktualisiert.', reservation });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Reservierungsstatus:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Aktualisiert Fahrzeuginformationen.
 */
export const updateCarByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { licensePlate, brand, model, year, color, location, dailyRate, isAvailable } = req.body;

    const car = await Car.findByPk(id);
    if (!car) return res.status(404).json({ message: 'Fahrzeug nicht gefunden.' });

    car.licensePlate = licensePlate ?? car.licensePlate;
    car.brand        = brand        ?? car.brand;
    car.model        = model        ?? car.model;
    car.year         = year         ?? car.year;
    car.color        = color        ?? car.color;
    car.location     = location     ?? car.location;
    car.dailyRate    = dailyRate    ?? car.dailyRate;
    car.isAvailable  = isAvailable  ?? car.isAvailable;

    await car.save();
    res.json({ message: 'Fahrzeugdaten aktualisiert.', car });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Fahrzeugs:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Legt einen neuen Tarif an.
 */
export const createRateByStaff = async (req, res) => {
  try {
    const { name, pricePerHour, description } = req.body;

    if (!name || pricePerHour === undefined || pricePerHour === null)
      return res.status(400).json({ message: 'Name und Preis pro Stunde sind erforderlich.' });

    if (isNaN(+pricePerHour))
      return res.status(400).json({ message: 'Preis pro Stunde muss eine Zahl sein.' });

    const rate = await Rate.create({ name, pricePerHour: +pricePerHour, description });
    res.status(201).json({ message: 'Tarif erstellt.', rate });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ message: 'Tarifname existiert bereits.' });

    console.error('Fehler beim Erstellen des Tarifs:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Löscht einen Tarif.
 */
export const deleteRateByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await Rate.findByPk(id);
    if (!rate) return res.status(404).json({ message: 'Tarif nicht gefunden.' });

    await rate.destroy();
    res.json({ message: 'Tarif gelöscht.' });
  } catch (error) {
    console.error('Fehler beim Löschen des Tarifs:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};
