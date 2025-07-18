/**
 * Admin- und Mitarbeiter-Routen für MoveSmart
 *
 * Sämtliche Endpunkte sind durch `authMiddleware` geschützt und verlangen
 * mindestens die Rolle `admin`, sofern nicht anders erwähnt.
 */
import { Router } from 'express';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js';

// Controller-Funktionen
import { deleteUser } from '../controllers/userController.js';
import { createCar, updateCar } from '../controllers/carController.js';
import { deleteReservation } from '../controllers/reservationController.js';
import { registerStaff } from '../controllers/authController.js';

const router = Router();

/**
 * Legt einen neuen Mitarbeiter-Account an (nur Admin).
 * Route: POST /api/admin/staff/register
 */
router.post('/staff/register', authMiddleware, authorizeRoles('admin'), registerStaff);

/**
 * Löscht einen Benutzer (nur Admin).
 * Route: DELETE /api/admin/users/:id
 */
router.delete('/users/:id', authMiddleware, authorizeRoles('admin'), deleteUser);

/**
 * Legt ein neues Fahrzeug an (nur Admin).
 * Route: POST /api/admin/car
 */
router.post('/car', authMiddleware, authorizeRoles('admin'), createCar);

/**
 * Aktualisiert ein Fahrzeug (nur Admin).
 * Route: PUT /api/admin/car/:id
 */
router.put('/car/:id', authMiddleware, authorizeRoles('admin'), updateCar);

/**
 * Löscht eine Reservierung (nur Admin).
 * Route: DELETE /api/admin/reservations/:id
 */
router.delete('/reservations/:id', authMiddleware, authorizeRoles('admin'), deleteReservation);

export default router;
