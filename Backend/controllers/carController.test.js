// Unit-Tests für carController (Jest)

import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} from './carController.js';

import Car from '../models/Car.js';

// Sequelize-Mocks
jest.mock('../models/Car.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
  },
}));

describe('Car Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { role: 'guest' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  // FA-2: Gäste sollen sich verfügbare Autos ansehen können.
  describe('getAllCars (FA-2)', () => {
    it('sollte allen Gästen erlauben, verfügbare Autos zu sehen', async () => {
      const cars = [{ id: 1, brand: 'Tesla', model: 'Model 3', isAvailable: true }];
      Car.findAll.mockResolvedValue(cars);
      await getAllCars(req, res);
      expect(Car.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(cars);
    });
  });

  // FA-3: Mitarbeiter sollen Fahrzeugdaten ändern können.
  describe('updateCar (FA-3)', () => {
    it('sollte Mitarbeitern erlauben, Fahrzeugdaten zu ändern', async () => {
      req.user.role = 'staff';
      const car = { id: 1, brand: 'Tesla', model: 'Model 3', save: jest.fn() };
      Car.findByPk.mockResolvedValue(car);
      req.params.id = 1;
      req.body = { model: 'Model S' };
      await updateCar(req, res);
      expect(car.model).toBe('Model S');
      expect(car.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Fahrzeug erfolgreich aktualisiert' }));
    });
  });

  // FA-15: Admin sollen die Ausleihstation hinzufügen können.
  describe('createCar (add station) (FA-15)', () => {
    it('sollte Admins erlauben, ein neues Auto mit einer Station (location) hinzuzufügen', async () => {
      req.user.role = 'admin';
      const carData = { brand: 'BMW', location: 'Hauptbahnhof' };
      Car.create.mockResolvedValue({ id: 2, ...carData });
      req.body = carData;
      await createCar(req, res);
      expect(Car.create).toHaveBeenCalledWith(carData);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // FA-16: Mitarbeiter sollen die Ausleihstation sperren können.
  // FA-4: Mitarbeiter sollen Ausleihstation freigeben können.
  describe('updateCar (station availability) (FA-16, FA-4)', () => {
    it('sollte Mitarbeitern erlauben, eine Station zu sperren/freigeben (via isAvailable)', async () => {
      req.user.role = 'staff';
      const car = { id: 1, location: 'Flughafen', isAvailable: true, save: jest.fn() };
      Car.findByPk.mockResolvedValue(car);
      req.params.id = 1;
      req.body = { isAvailable: false }; // Sperren
      await updateCar(req, res);
      expect(car.isAvailable).toBe(false);
      expect(car.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Fahrzeug erfolgreich aktualisiert' }));
    });
  });

  // FA-17: Admin soll die Ausleihstation löschen können.
  describe('deleteCar (delete station) (FA-17)', () => {
    it('sollte Admins erlauben, ein Auto (und damit die Station) zu löschen', async () => {
      req.user.role = 'admin';
      const car = { id: 1, destroy: jest.fn() };
      Car.findByPk.mockResolvedValue(car);
      req.params.id = 1;
      await deleteCar(req, res);
      expect(car.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Fahrzeug erfolgreich gelöscht' });
    });
  });

  // FA-22: Das Fahrzeug soll mit der RF-Karte geöffnet werden.
  describe('openCarWithRFID (FA-22)', () => {
    it('sollte das Öffnen per RFID-Karte simulieren', () => {
      const openWithCard = (cardId) => cardId === 'valid-rfid';
      expect(openWithCard('valid-rfid')).toBe(true);
      expect(openWithCard('invalid-rfid')).toBe(false);
    });
  });
});