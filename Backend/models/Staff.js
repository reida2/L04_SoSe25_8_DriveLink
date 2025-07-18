/**
 * Staff‑Modell für MoveSmart
 *
 * Repräsentiert Mitarbeiterkonten, die sich von regulären Nutzern vor allem
 * durch die Standardrolle „staff“ unterscheiden. Das Passwort wird als
 * BCrypt‑Hash gespeichert; ein Pre‑Save‑Hook kann bei Bedarf ergänzt werden.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /**
   * Eindeutiger Login‑Name für den Mitarbeitenden.
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
   * BCrypt‑Hash des Passworts (Nie im Klartext speichern).
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * Rolle – voreingestellt auf „staff“.
   */
  role: {
    type: DataTypes.ENUM('staff', 'user'),
    allowNull: false,
    defaultValue: 'staff',
  },
}, {
  tableName: 'staff',
  timestamps: true,
});

export default Staff;
