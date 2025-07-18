/**
 * Tarif‑Routen für MoveSmart
 *
 * Zugriffsregeln
 * • POST   /api/rates           – Tarif anlegen (Admin/Mitarbeiter)
 * • GET    /api/rates           – Alle Tarife (öffentlich)
 * • GET    /api/rates/:id       – Einzelner Tarif (öffentlich)
 * • PUT    /api/rates/:id       – Tarif aktualisieren (Admin/Mitarbeiter)
 * • DELETE /api/rates/:id       – Tarif löschen (Admin/Mitarbeiter)
 */
import { Router } from 'express';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createRate,
  getAllRates,
  getRateById,
  updateRate,
  deleteRate,
} from '../controllers/ratesController.js';

const router = Router();

// Tarif anlegen (Admin oder Mitarbeiter)
router.post('/', authMiddleware, authorizeRoles('admin', 'mitarbeiter'), createRate);

// Alle Tarife (öffentlich)
router.get('/', getAllRates);

// Einzelnen Tarif abrufen (öffentlich)
router.get('/:id', getRateById);

// Tarif aktualisieren (Admin oder Mitarbeiter)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'mitarbeiter'), updateRate);

// Tarif löschen (Admin oder Mitarbeiter)
router.delete('/:id', authMiddleware, authorizeRoles('admin', 'mitarbeiter'), deleteRate);

export default router;
