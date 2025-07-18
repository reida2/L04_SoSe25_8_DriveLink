/**
 * Einmaliges Skript, um einen Admin‑Account in die Datenbank einzufügen.
 *
 * Aufruf:  node scripts/createAdmin.js
 *          (legt Admin nur an, wenn noch keiner existiert)
 */
import dotenv from 'dotenv';
import path   from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import User      from './models/User.js';
import { connectDB } from './config/database.js';

// .env laden (relativ zu diesem Skript)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function createAdmin() {
  await connectDB();

  const existing = await User.findOne({ where: { role: 'admin' } });
  if (existing) {
    console.log('Admin existiert bereits.');
    return;
  }

  const passwordHash = await bcrypt.hash('12345', 10);

  const admin = await User.create({
    username: 'admin',
    email   : 'admin@example.com',
    password: passwordHash,
    role    : 'admin',
  });

  console.log('Admin‑User angelegt:', admin.username);
}

createAdmin()
  .then(() => process.exit())
  .catch(err => {
    console.error('Fehler beim Anlegen des Admins:', err);
    process.exit(1);
  });
