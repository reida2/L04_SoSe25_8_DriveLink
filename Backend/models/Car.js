/**
 * Fahrzeug‑Modell für MoveSmart
 *
 * Enthält Stammdaten eines einzelnen Fahrzeugs, die für Buchungen und
 * Flottenverwaltung benötigt werden.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /**
   * Eindeutiges Kennzeichen (z. B. "B‑MS 1234").
   */
  licensePlate: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: DataTypes.STRING,
  /**
   * Aktueller Standort des Fahrzeugs (City‑/Station‑Name).
   */
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * Tagesmietpreis in €.
   */
  dailyRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'cars',
  // timestamps: false,
});

export default Car;
