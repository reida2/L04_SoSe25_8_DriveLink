/**
 * Benutzer‑Modell für MoveSmart
 *
 * Enthält sowohl Kontoinformationen als auch optionale Führerschein‑ und
 * Zahlungsdaten eines Endkunden. Rollen: user | admin | mitarbeiter.
 */
import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/database.js';

const User = sequelize.define('User', {
  /* Primärschlüssel */
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  /* Konto */
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'mitarbeiter'),
    allowNull: false,
    defaultValue: 'user',
  },

  /* Führerschein */
  licenseNo       : DataTypes.STRING,
  licenseIssue    : DataTypes.DATEONLY,
  licenseExpiry   : DataTypes.DATEONLY,
  licenseFrontPath: DataTypes.STRING,
  licenseBackPath : DataTypes.STRING,

  /* Payment */
  payType: DataTypes.STRING,   // 'card' | 'sepa' | 'paypal'
  iban   : DataTypes.STRING,
  bic    : DataTypes.STRING,
  cardNo : DataTypes.STRING,
  cardExp: DataTypes.STRING,
  cardCvc: DataTypes.STRING,
}, {
  tableName: 'users',
});

export default User;
