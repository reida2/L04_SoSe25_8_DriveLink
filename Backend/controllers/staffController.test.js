// Unit‑Tests für staffController (Jest)

import {
  updateUserDataByStaff,
  getReservationsByUser,
  updateReservationStatusByStaff,
  updateCarByStaff,
  createRateByStaff,
  deleteRateByStaff,
} from './staffController.js';

import User        from '../models/User.js';
import Car         from '../models/Car.js';
import Reservation from '../models/Reservation.js';
import Rate        from '../models/Rates.js';

// Sequelize‑Mocks (vereinfachtes In‑Memory‑Stub)
jest.mock('../config/database.js', () => ({
  sequelize: {
    define: jest.fn(() => ({
      create  : jest.fn(),
      findOne : jest.fn(),
      findByPk: jest.fn(),
      findAll : jest.fn(),
      destroy : jest.fn(),
      save    : jest.fn(),
    })),
    sync: jest.fn(),
  },
  connectDB: jest.fn(async () => {}),
}));

jest.mock('../models/User.js', () => ({ __esModule: true, default: { findByPk: jest.fn(), save: jest.fn() } }));
jest.mock('../models/Car.js', () => ({ __esModule: true, default: { findByPk: jest.fn(), save: jest.fn() } }));
jest.mock('../models/Reservation.js', () => ({ __esModule: true, default: { findAll: jest.fn(), findByPk: jest.fn(), save: jest.fn() } }));
jest.mock('../models/Rates.js', () => ({ __esModule: true, default: { create: jest.fn(), findByPk: jest.fn(), destroy: jest.fn() } }));


describe('Staff Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  describe('updateUserDataByStaff', () => {
    it('aktualisiert Benutzerdaten', async () => {
      const user = { id: 1, username: 'old', email: 'old@ex', save: jest.fn() };
      User.findByPk.mockResolvedValue(user);
      req.params.id = 1;
      req.body = { username: 'new', email: 'new@ex' };

      await updateUserDataByStaff(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(user.username).toBe('new');
      expect(user.email).toBe('new@ex');
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Benutzerdaten erfolgreich aktualisiert.', user });
    });

    it('gibt 404 zurück, wenn Nutzer fehlt', async () => {
      User.findByPk.mockResolvedValue(null);
      req.params.id = 1;

      await updateUserDataByStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Benutzer nicht gefunden.' });
    });
  });

  describe('getReservationsByUser', () => {
    it('gibt alle Reservierungen eines Nutzers aus', async () => {
      const all = [{ id: 1 }, { id: 2 }];
      Reservation.findAll.mockResolvedValue(all);
      req.params.userId = 1;

      await getReservationsByUser(req, res);

      expect(Reservation.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: [
          { model: User, attributes: ['id', 'username', 'email'] },
          { model: Car,  attributes: ['id', 'brand', 'model', 'licensePlate'] },
        ],
      });
      expect(res.json).toHaveBeenCalledWith(all);
    });
  });

  describe('updateReservationStatusByStaff', () => {
    it('aktualisiert Reservierungsstatus', async () => {
      const resv = { id: 1, status: 'pending', save: jest.fn() };
      Reservation.findByPk.mockResolvedValue(resv);
      req.params.id = 1;
      req.body = { status: 'confirmed' };

      await updateReservationStatusByStaff(req, res);

      expect(Reservation.findByPk).toHaveBeenCalledWith(1);
      expect(resv.status).toBe('confirmed');
      expect(resv.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Reservierungsstatus aktualisiert.', reservation: resv });
    });

    it('gibt 404 zurück, wenn Reservierung fehlt', async () => {
      Reservation.findByPk.mockResolvedValue(null);
      req.params.id = 1;

      await updateReservationStatusByStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reservierung nicht gefunden.' });
    });
  });

  describe('updateCarByStaff', () => {
    it('aktualisiert Fahrzeugdaten', async () => {
      const car = { id: 1, brand: 'old', save: jest.fn() };
      Car.findByPk.mockResolvedValue(car);
      req.params.id = 1;
      req.body = { brand: 'new' };

      await updateCarByStaff(req, res);

      expect(Car.findByPk).toHaveBeenCalledWith(1);
      expect(car.brand).toBe('new');
      expect(car.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Fahrzeugdaten aktualisiert.', car });
    });

    it('gibt 404 zurück, wenn Fahrzeug fehlt', async () => {
      Car.findByPk.mockResolvedValue(null);
      req.params.id = 1;

      await updateCarByStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Fahrzeug nicht gefunden.' });
    });
  });

  describe('createRateByStaff', () => {
    it('legt Tarif an', async () => {
      const rate = { name: 'x', pricePerHour: 10 };
      Rate.create.mockResolvedValue(rate);
      req.body = rate;

      await createRateByStaff(req, res);

      expect(Rate.create).toHaveBeenCalledWith({ name: 'x', pricePerHour: 10, description: undefined });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarif erstellt.', rate });
    });

    it('gibt 400 zurück, wenn Daten fehlen', async () => {
      req.body = { name: 'x' };
      await createRateByStaff(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name und Preis pro Stunde sind erforderlich.' });
    });
  });

  describe('deleteRateByStaff', () => {
    it('löscht Tarif', async () => {
      const rate = { id: 1, destroy: jest.fn() };
      Rate.findByPk.mockResolvedValue(rate);
      req.params.id = 1;

      await deleteRateByStaff(req, res);

      expect(Rate.findByPk).toHaveBeenCalledWith(1);
      expect(rate.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarif gelöscht.' });
    });

    it('gibt 404 zurück, wenn Tarif fehlt', async () => {
      Rate.findByPk.mockResolvedValue(null);
      req.params.id = 1;

      await deleteRateByStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarif nicht gefunden.' });
    });
  });
});
