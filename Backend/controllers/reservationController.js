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
import Reservation from '../models/Reservation.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// Neue Reservierung erstellen
export const createReservation = async (req, res) => {
    const { carId, startTime, endTime, dropOffLocation } = req.body; // dropOffLocation hinzugefügt
    const userId = req.user.id; // Kommt vom JWT

    if (!carId || !startTime || !endTime) {
        return res.status(400).json({ message: 'Car ID, start time, and end time are required.' });
    }

    try {
        // Prüfen, ob Auto existiert
        const car = await Car.findByPk(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found.' });
        }

        // Prüfen, ob Auto für den Zeitraum verfügbar ist
        const existingReservations = await Reservation.findAll({
            where: {
                carId: carId,
                // Standard-Überlappungsprüfung: (StartA < EndB) and (EndA > StartB)
                // Eine bestehende Reservierung (A) überlappt mit der neuen (B) wenn:
                // existing.startTime < new.endTime AND existing.endTime > new.startTime
                startTime: { [Op.lt]: new Date(endTime) },
                endTime: { [Op.gt]: new Date(startTime) }
            }
        });

        if (existingReservations.length > 0) {
            return res.status(400).json({ message: 'Car is not available for the selected time slot.' });
        }

        // Kosten berechnen 
        const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
        if (durationMs <= 0) {
            return res.status(400).json({ message: 'End time must be after start time.' });
        }
        const durationHours = durationMs / (1000 * 60 * 60);
        const totalCost = car.dailyRate * (durationHours / 24); 

        const newReservationData = {
            userId,
            carId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            totalCost: parseFloat(totalCost.toFixed(2)),
            status: 'pending' 
        };

        if (dropOffLocation) {
            newReservationData.dropOffLocation = dropOffLocation;
        }

        const newReservation = await Reservation.create(newReservationData);

        res.status(201).json({ message: 'Reservation created successfully', reservation: newReservation });
    } catch (error) {
        console.error('Create reservation error:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Server error while creating reservation.' });
    }
};

// Alle Reservierungen abrufen (Admin oder eigene des Users)
export const getReservations = async (req, res) => {
    try {
        let whereClause = {};
        // Wenn es kein Admin ist, nur eigene Reservierungen abrufen
        if (req.user.role !== 'admin') {
            whereClause.userId = req.user.id;
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [
                { model: User, attributes: ['id', 'username', 'email'] }, // Inkludiere Benutzerdetails
                { model: Car, attributes: ['id', 'brand', 'model', 'licensePlate'] } // Inkludiere Fahrzeugdetails
            ]
        });
        res.json(reservations);
    } catch (error) {
        console.error('Get reservations error:', error.message);
        // Sende JSON-Antwort im Fehlerfall
        res.status(500).json({ message: 'Server error while fetching reservations.' });
    }
};

// Reservierung nach ID abrufen
export const getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['id', 'username', 'email'] },
                { model: Car, attributes: ['id', 'brand', 'model', 'licensePlate'] }
            ]
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Sicherstellen, dass nur der eigene Benutzer oder ein Admin die Reservierung sehen kann
        if (req.user.role !== 'admin' && reservation.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this reservation' });
        }

        res.json(reservation);
    } catch (error) {
        console.error('Get reservation by ID error:', error.message);
        res.status(500).send('Server error');
    }
};


// Reservierung aktualisieren (Admin oder Besitzer, eingeschränkt)
export const updateReservation = async (req, res) => {
    const { id } = req.params; // ID der zu aktualisierenden Reservierung
    // Felder, die potenziell geändert werden können:
    const { startTime, endTime, status, totalCost, carId, userId, dropOffLocation } = req.body;

    try {
        let reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Nur Admin oder der Besitzer der Reservierung darf ändern
        if (req.user.role !== 'admin' && reservation.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this reservation' });
        }

        // Benutzer darf nur bestimmte Felder ändern (z.B. Zeiträume, nicht Status oder Kosten)
        // Admin darf alles ändern

        let newStartTime = startTime ? new Date(startTime) : reservation.startTime;
        let newEndTime = endTime ? new Date(endTime) : reservation.endTime;
        const newCarId = (req.user.role === 'admin' && carId) ? carId : reservation.carId; // Nur Admin kann carId ändern

        // Wenn Zeiten oder Fahrzeug geändert werden, Verfügbarkeit prüfen und Kosten neu berechnen
        if (startTime || endTime || (req.user.role === 'admin' && carId && carId !== reservation.carId)) {
            if (newEndTime.getTime() <= newStartTime.getTime()) {
                return res.status(400).json({ message: 'End time must be after start time.' });
            }

            const carToReserve = await Car.findByPk(newCarId);
            if (!carToReserve) {
                return res.status(404).json({ message: 'Car not found for reservation update.' });
            }

            // Verfügbarkeitsprüfung (andere Reservierungen für dieses Auto ausschließen)
            const conflictingReservations = await Reservation.findAll({
                where: {
                    id: { [Op.ne]: reservation.id }, // Schließe die aktuelle Reservierung aus
                    carId: newCarId,
                    [Op.or]: [
                        { startTime: { [Op.lt]: newEndTime }, endTime: { [Op.gt]: newStartTime } },
                        { startTime: { [Op.gte]: newStartTime, [Op.lt]: newEndTime } }, // Überlappt Start
                        { endTime: { [Op.gt]: newStartTime, [Op.lte]: newEndTime } }    // Überlappt Ende
                    ]
                }
            });

            if (conflictingReservations.length > 0) {
                return res.status(400).json({ message: 'Car is not available for the new selected time slot.' });
            }

            reservation.startTime = newStartTime;
            reservation.endTime = newEndTime;

            // Kosten neu berechnen
            const durationMs = newEndTime.getTime() - newStartTime.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);
            reservation.totalCost = parseFloat((carToReserve.dailyRate * (durationHours / 24)).toFixed(2));
        }

        // Update anderer Felder basierend auf Rolle
        if (req.user.role === 'admin') {
            if (status) reservation.status = status;
            if (totalCost && !startTime && !endTime) reservation.totalCost = parseFloat(totalCost); // Nur wenn nicht schon durch Zeitänderung berechnet
            if (userId) reservation.userId = userId; // Admin kann den Benutzer ändern
            if (carId) reservation.carId = carId; // Admin kann das Auto ändern (Verfügbarkeit oben geprüft)
            // dropOffLocation kann von Admin und Benutzer geändert werden (siehe unten)
        } else { // Normaler Benutzer
            if (status === 'cancelled') { // Benutzer kann nur stornieren
                reservation.status = status;
            }
            // startTime, endTime, totalCost wurden oben schon behandelt, wenn geändert
        }

        // dropOffLocation kann von beiden (Besitzer oder Admin) geändert werden
        // Wenn 'dropOffLocation' im Body ist, wird es aktualisiert.
        // Um es explizit zu löschen, könnte man 'null' senden.
        if (dropOffLocation !== undefined) { // Erlaube auch das Setzen auf null/leeren String
            reservation.dropOffLocation = dropOffLocation;
        }


        await reservation.save();
        res.json({ message: 'Reservation updated successfully', reservation });
    } catch (error) {
        console.error('Update reservation error:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Server error while updating reservation.'});
    }
};

// Reservierung löschen (Admin oder Besitzer)
export const deleteReservation = async (req, res) => {
    const { id } = req.params;
    try {
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Nur Admin oder der Besitzer der Reservierung darf löschen
        if (req.user.role !== 'admin' && reservation.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this reservation' });
        }

        await reservation.destroy();
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Delete reservation error:', error.message);
        res.status(500).send('Server error');
    }
};