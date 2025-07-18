// Backend/controllers/staffController.test.js

import {
    updateUserDataByStaff,
    getReservationsByUser,
    updateReservationStatusByStaff,
    updateCarByStaff,
    createRateByStaff,
    deleteRateByStaff,
} from './staffController.js';

import User from '../models/User.js';
import Car from '../models/Car.js';
import Reservation from '../models/Reservation.js';
import Rate from '../models/Rates.js';

jest.mock('../config/database.js', () => ({
    sequelize: {
        define: jest.fn((modelName, attributes, options) => {
            const mockModel = {
                create: jest.fn(),
                findOne: jest.fn(),
                findByPk: jest.fn(),
                findAll: jest.fn(),
                destroy: jest.fn(),
                save: jest.fn(),
            };
            return mockModel;
        }),
        sync: jest.fn(),
    },
    connectDB: jest.fn(async () => {}),
}));

jest.mock('../models/User.js', () => ({ __esModule: true, default: { findByPk: jest.fn(), save: jest.fn() } }));
jest.mock('../models/Car.js', () => ({ __esModule: true, default: { findByPk: jest.fn(), save: jest.fn() } }));
jest.mock('../models/Reservation.js', () => ({ __esModule: true, default: { findAll: jest.fn(), findByPk: jest.fn(), save: jest.fn() } }));
jest.mock('../models/Rates.js', () => ({ __esModule: true, default: { create: jest.fn(), findByPk: jest.fn(), destroy: jest.fn() } }));


describe('Staff Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updateUserDataByStaff', () => {
        it('should update a user\'s data successfully', async () => {
            const mockUser = { id: 1, username: 'olduser', email: 'old@example.com', save: jest.fn() };
            User.findByPk.mockResolvedValue(mockUser);
            mockReq.params.id = 1;
            mockReq.body = { username: 'newuser', email: 'new@example.com' };

            await updateUserDataByStaff(mockReq, mockRes);

            expect(User.findByPk).toHaveBeenCalledWith(1);
            expect(mockUser.username).toBe('newuser');
            expect(mockUser.email).toBe('new@example.com');
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Benutzerdaten erfolgreich aktualisiert (durch Mitarbeiter).', user: mockUser });
        });

        it('should return 404 if user not found', async () => {
            User.findByPk.mockResolvedValue(null);
            mockReq.params.id = 1;

            await updateUserDataByStaff(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Benutzer nicht gefunden.' });
        });
    });

    describe('getReservationsByUser', () => {
        it('should get all reservations for a user', async () => {
            const mockReservations = [{ id: 1 }, { id: 2 }];
            Reservation.findAll.mockResolvedValue(mockReservations);
            mockReq.params.userId = 1;

            await getReservationsByUser(mockReq, mockRes);

            expect(Reservation.findAll).toHaveBeenCalledWith({
                where: { userId: 1 },
                include: [
                    { model: User, attributes: ['id', 'username', 'email'] },
                    { model: Car, attributes: ['id', 'brand', 'model', 'licensePlate'] }
                ]
            });
            expect(mockRes.json).toHaveBeenCalledWith(mockReservations);
        });
    });

    describe('updateReservationStatusByStaff', () => {
        it('should update a reservation\'s status successfully', async () => {
            const mockReservation = { id: 1, status: 'pending', save: jest.fn() };
            Reservation.findByPk.mockResolvedValue(mockReservation);
            mockReq.params.id = 1;
            mockReq.body = { status: 'confirmed' };

            await updateReservationStatusByStaff(mockReq, mockRes);

            expect(Reservation.findByPk).toHaveBeenCalledWith(1);
            expect(mockReservation.status).toBe('confirmed');
            expect(mockReservation.save).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Reservierungsstatus erfolgreich aktualisiert (durch Mitarbeiter).', reservation: mockReservation });
        });

        it('should return 404 if reservation not found', async () => {
            Reservation.findByPk.mockResolvedValue(null);
            mockReq.params.id = 1;

            await updateReservationStatusByStaff(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Reservierung nicht gefunden.' });
        });
    });

    describe('updateCarByStaff', () => {
        it('should update a car\'s data successfully', async () => {
            const mockCar = { id: 1, brand: 'oldbrand', save: jest.fn() };
            Car.findByPk.mockResolvedValue(mockCar);
            mockReq.params.id = 1;
            mockReq.body = { brand: 'newbrand' };

            await updateCarByStaff(mockReq, mockRes);

            expect(Car.findByPk).toHaveBeenCalledWith(1);
            expect(mockCar.brand).toBe('newbrand');
            expect(mockCar.save).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Fahrzeugdaten erfolgreich aktualisiert (durch Mitarbeiter).', car: mockCar });
        });

        it('should return 404 if car not found', async () => {
            Car.findByPk.mockResolvedValue(null);
            mockReq.params.id = 1;

            await updateCarByStaff(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Fahrzeug nicht gefunden.' });
        });
    });

    describe('createRateByStaff', () => {
        it('should create a new rate successfully', async () => {
            const newRate = { name: 'testrate', pricePerHour: 10 };
            Rate.create.mockResolvedValue(newRate);
            mockReq.body = newRate;

            await createRateByStaff(mockReq, mockRes);

            expect(Rate.create).toHaveBeenCalledWith({ name: 'testrate', pricePerHour: 10, description: undefined });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tarif erfolgreich erstellt (durch Mitarbeiter).', rate: newRate });
        });

        it('should return 400 if name or price is missing', async () => {
            mockReq.body = { name: 'testrate' };

            await createRateByStaff(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Name und Preis pro Stunde sind erforderlich.' });
        });
    });

    describe('deleteRateByStaff', () => {
        it('should delete a rate successfully', async () => {
            const mockRate = { id: 1, destroy: jest.fn() };
            Rate.findByPk.mockResolvedValue(mockRate);
            mockReq.params.id = 1;

            await deleteRateByStaff(mockReq, mockRes);

            expect(Rate.findByPk).toHaveBeenCalledWith(1);
            expect(mockRate.destroy).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tarif erfolgreich gelöscht (durch Mitarbeiter).' });
        });

        it('should return 404 if rate not found', async () => {
            Rate.findByPk.mockResolvedValue(null);
            mockReq.params.id = 1;

            await deleteRateByStaff(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tarif nicht gefunden.' });
        });
    });
});
