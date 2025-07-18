/**
 * Fahrzeug-Routen für MoveSmart
 *
 * Zugriffsregeln
 *
 * • POST   /api/cars           – Fahrzeug anlegen (Admin)
 * • GET    /api/cars           – Alle Fahrzeuge (öffentlich)
 * • GET    /api/cars/:id       – Ein Fahrzeug (authentifiziert)
 * • PUT    /api/cars/:id       – Fahrzeug aktualisieren (Admin)
 * • DELETE /api/cars/:id       – Fahrzeug löschen (Admin)
 */
import { Router } from 'express';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
} from '../controllers/carController.js';

const router = Router();

// Fahrzeug anlegen (nur Admin)
router.post('/', authMiddleware, authorizeRoles('admin'), createCar);

// Alle Fahrzeuge – hier bewusst ohne Auth, um öffentliche Listen zu erlauben
router.get('/', getAllCars);

// Einzelnes Fahrzeug (nur eingeloggte Nutzer)
router.get('/:id', authMiddleware, getCarById);

// Fahrzeug aktualisieren (nur Admin)
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateCar);

// Fahrzeug löschen (nur Admin)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteCar);

export default router;
