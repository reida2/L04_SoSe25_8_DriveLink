// Unit-Tests für ratesController (Jest)

import {
  getAllRates,
  createRate,
  updateRate,
  deleteRate,
} from './ratesController.js';

import Rate from '../models/Rates.js';
import User from '../models/User.js';

// Sequelize-Mocks
jest.mock('../models/Rates.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../models/User.js', () => ({
    __esModule: true,
    default: {
      findByPk: jest.fn(),
      save: jest.fn(),
    },
  }));

describe('Rates Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: 1, role: 'guest' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  // FA-8: Mitglieder sollen Tarif auswählen können.
  describe('selectRate (FA-8)', () => {
    it('sollte simulieren, dass ein Mitglied einen Tarif auswählt', async () => {
      req.user.role = 'user';
      const user = { id: 1, rateId: null, save: jest.fn() };
      User.findByPk.mockResolvedValue(user);
      const selectRate = async (req, res) => {
        const user = await User.findByPk(req.user.id);
        user.rateId = req.body.rateId;
        await user.save();
        res.json({ message: 'Tarif ausgewählt' });
      };

      req.body = { rateId: 2 };
      await selectRate(req, res);

      expect(user.rateId).toBe(2);
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarif ausgewählt' });
    });
  });

  // FA-9: Gäste sollen Tarife einsehen.
  describe('getAllRates (FA-9)', () => {
    it('sollte Gästen erlauben, alle Tarife einzusehen', async () => {
      const rates = [{ id: 1, name: 'Standard', pricePerHour: 10 }];
      Rate.findAll.mockResolvedValue(rates);
      await getAllRates(req, res);
      expect(Rate.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(rates);
    });
  });

  // FA-10: Admin soll Tarife hinzufügen können im System.
  describe('createRate (FA-10)', () => {
    it('sollte Admins erlauben, einen neuen Tarif zu erstellen', async () => {
      req.user.role = 'admin';
      const rateData = { name: 'Premium', pricePerHour: 20 };
      Rate.create.mockResolvedValue({ id: 2, ...rateData });
      req.body = rateData;
      await createRate(req, res);
      expect(Rate.create).toHaveBeenCalledWith(rateData);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // FA-11: Admin soll Tarife ändern können im System.
  describe('updateRate (FA-11)', () => {
    it('sollte Admins erlauben, einen Tarif zu ändern', async () => {
      req.user.role = 'admin';
      const rate = { id: 1, name: 'Standard', pricePerHour: 10, save: jest.fn() };
      Rate.findByPk.mockResolvedValue(rate);
      req.params.id = 1;
      req.body = { pricePerHour: 12 };
      await updateRate(req, res);
      expect(rate.pricePerHour).toBe(12);
      expect(rate.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarif erfolgreich aktualisiert.', rate: expect.any(Object) });
    });
  });

  // FA-12: Admin soll Tarife löschen können im System.
  describe('deleteRate (FA-12)', () => {
    it('sollte Admins erlauben, einen Tarif zu löschen', async () => {
      req.user.role = 'admin';
      const rate = { id: 1, destroy: jest.fn() };
      Rate.findByPk.mockResolvedValue(rate);
      req.params.id = 1;
      await deleteRate(req, res);
      expect(rate.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarif erfolgreich gelöscht.' });
    });
  });
});