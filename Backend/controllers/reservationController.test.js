// Unit-Tests für reservationController (Jest)

import {
  createReservation,
  updateReservation,
  deleteReservation,
  getReservations,
  getReservationById,
} from './reservationController.js';

import User from '../models/User.js';
import Car from '../models/Car.js';
import Reservation from '../models/Reservation.js';

// Sequelize-Mocks
jest.mock('../config/database.js', () => ({
  sequelize: {
    define: jest.fn(() => ({
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
      save: jest.fn(),
    })),
    sync: jest.fn(),
  },
  connectDB: jest.fn(async () => {}),
}));

jest.mock('../models/User.js', () => ({ __esModule: true, default: { findByPk: jest.fn() } }));
jest.mock('../models/Car.js', () => ({ __esModule: true, default: { findByPk: jest.fn() } }));
jest.mock('../models/Reservation.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
  },
}));

describe('Reservation Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: 1, role: 'user' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  // FA-13: Mitglieder sollen Autos reservieren können.
  // FA-5: Es soll möglich sein, als Mitglied Autos zu Buchen.
  describe('createReservation (FA-13, FA-5)', () => {
    it('sollte einem Mitglied erlauben, ein Auto zu reservieren', async () => {
      const car = { id: 1, dailyRate: 100 };
      const reservationData = { id: 1, carId: 1, userId: 1, status: 'pending' };
      Car.findByPk.mockResolvedValue(car);
      Reservation.findAll.mockResolvedValue([]);
      Reservation.create.mockResolvedValue(reservationData);

      req.body = { carId: 1, startTime: '2025-01-01T10:00:00Z', endTime: '2025-01-01T12:00:00Z' };

      await createReservation(req, res);

      expect(Car.findByPk).toHaveBeenCalledWith(1);
      expect(Reservation.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Reservation created successfully',
        reservation: reservationData,
      }));
    });
  });

  // FA-14: Mitarbeiter sollen Reservierung anlegen können.
  describe('createReservation by Staff (FA-14)', () => {
    it('sollte einem Mitarbeiter erlauben, eine Reservierung für einen Kunden anzulegen', async () => {
      req.user.role = 'staff';
      const car = { id: 2, dailyRate: 120 };
      const reservationData = { id: 2, carId: 2, userId: 5, status: 'confirmed' }; 
      Car.findByPk.mockResolvedValue(car);
      Reservation.findAll.mockResolvedValue([]);
      Reservation.create.mockResolvedValue(reservationData);

      req.body = { carId: 2, userId: 5, startTime: '2025-02-01T10:00:00Z', endTime: '2025-02-01T12:00:00Z', status: 'confirmed' };
      await createReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Reservation created successfully',
      }));
    });
  });

  // FA-6: Mitglieder sollen die Buchung stornieren können.
  describe('updateReservation (cancel) (FA-6)', () => {
    it('sollte einem Mitglied erlauben, die eigene Reservierung zu stornieren', async () => {
      const reservation = { id: 1, userId: 1, status: 'confirmed', save: jest.fn() };
      Reservation.findByPk.mockResolvedValue(reservation);
      req.params.id = 1;
      req.body = { status: 'cancelled' };

      await updateReservation(req, res);

      expect(Reservation.findByPk).toHaveBeenCalledWith(1);
      expect(reservation.status).toBe('cancelled');
      expect(reservation.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Reservation updated successfully',
      }));
    });
  });
});