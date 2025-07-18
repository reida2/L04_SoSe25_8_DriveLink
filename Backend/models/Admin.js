/**
 * Admin‑/Mitarbeiter‑Modell für MoveSmart
 *
 * Repräsentiert interne Nutzerkonten (Admin, Mitarbeiter) und re‑used viele
 * Felder des regulären Users. Ein Passwort‑Hashing‑Hook kann bei Bedarf
 * ergänzt werden – das Modell selbst speichert nur den Hash.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
// bcrypt könnte in einem Hook genutzt werden, ist hier aber noch ungenutzt.
import bcrypt from 'bcryptjs';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /**
   * Eindeutiger Login‑Name.
   */
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  /**
   * Dienstliche E‑Mail‑Adresse.
   */
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  /**
   * BCrypt‑Hash des Passworts. Nie im Klartext speichern.
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * Rolle des Kontos – richtet die Berechtigungen aus.
   */
  role: {
    type: DataTypes.ENUM('user', 'admin', 'mitarbeiter'),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  tableName: 'admins',
  // timestamps: false,
});

export default Admin;
