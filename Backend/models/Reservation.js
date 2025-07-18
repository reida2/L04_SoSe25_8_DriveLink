/**
 * Reservierungs‑Modell für MoveSmart
 *
 * Verknüpft Nutzer und Fahrzeuge für einen bestimmten Zeitraum und enthält
 * Preis‑ sowie Statusinformationen. Enthält zusätzlich einen optionalen
 * Abgabeort (dropOffLocation), falls das Fahrzeug an einer anderen Station
 * zurückgegeben wird.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';
import Car  from './Car.js';

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /** Startzeitpunkt der Reservierung (ISO‑Datum). */
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  /** Endzeitpunkt der Reservierung (muss > startTime sein). */
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  /** Gesamtkosten in €, werden bei Buchung oder Update berechnet. */
  totalCost: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  /**
   * Status‑Workflow: z. B. pending → confirmed → completed oder cancelled.
   */
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  /**
   * Optionaler alternativer Abgabeort (falls von Abhol‑Ort abweichend).
   */
  dropOffLocation: DataTypes.STRING,
}, {
  tableName: 'reservations',
  timestamps: true,
});

// ───────────────────────────────────────────────────────────
// Associations
// Ein Nutzer kann viele Reservierungen haben; ein Fahrzeug ebenso.
// ───────────────────────────────────────────────────────────
User.hasMany(Reservation, { foreignKey: 'userId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

Car.hasMany(Reservation, { foreignKey: 'carId' });
Reservation.belongsTo(Car,  { foreignKey: 'carId' });

export default Reservation;
