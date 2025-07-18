
//  routes/authRoutes.js

import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { upload } from '../utils/upload.js';

const router = Router();

// ---------- Registrierung ----------
router.post(
  '/register',
  upload.fields([
    { name: 'licenseFront', maxCount: 1 },
    { name: 'licenseBack',  maxCount: 1 }
  ]),
  register
);

// ---------- Login ----------
router.post('/login', login);

export default router;