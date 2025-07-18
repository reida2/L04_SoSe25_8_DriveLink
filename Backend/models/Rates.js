/**
 * Tarif‑Modell für MoveSmart
 *
 * Speichert unterschiedliche Preispläne (z. B. Standard‑, Studenten‑ oder
 * Wochenend‑Tarif). Jeder Tarif hat einen eindeutigen Namen und einen Preis
 * pro Stunde. Die Tabelle trägt den Namen `rates` und nutzt `createdAt`/
 * `updatedAt` für eine einfache Historie.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Rate = sequelize.define('Rate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /**
   * Klarer, eindeutiger Tarifname (z. B. "Student", "Weekend Special").
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  /**
   * Preis pro Stunde in €, Genauigkeit 2 Nachkommastellen.
   */
  pricePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  /**
   * Freitext‑Beschreibung (optional).
   */
  description: DataTypes.TEXT,
}, {
  tableName: 'rates',
  timestamps: true,
});

export default Rate;
