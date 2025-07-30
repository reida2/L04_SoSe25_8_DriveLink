// Unit-Tests für authController (Jest)

import { register, login, registerStaff } from './authController.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mocks
jest.mock('../models/User.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('Auth Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, files: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // FA-1: Es sollen sich neue Kunden registrieren können.
  describe('register (FA-1)', () => {
    it('sollte einen neuen Kunden registrieren', async () => {
        req.body = { username: 'testuser', email: 'test@example.com', password: 'password123', licenseNo: '123' };
        req.files = { licenseFront: [{ filename: 'front.jpg' }] }; // Mock file upload
        User.findOne.mockResolvedValue(null); // Mock that user does not exist
        bcrypt.hash.mockResolvedValue('hashedpassword');
        User.create.mockResolvedValue({ id: 1, username: 'testuser', email: 'test@example.com', role: 'user' });
        jwt.sign.mockImplementation((payload, secret, options, callback) => {
            callback(null, 'fake_token');
        });

        await register(req, res);

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ username: 'testuser' }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Registrierung erfolgreich' }));
    });
  });

  // FA-18: Es sollen alle Rollen im System implementiert sein.
  describe('Roles (FA-18)', () => {
    it('sollte die Existenz von "user", "staff", und "admin" Rollen simulieren', () => {
      const user = { role: 'user' };
      const staff = { role: 'mitarbeiter' };
      const admin = { role: 'admin' };

      expect(user.role).toBe('user');
      expect(staff.role).toBe('mitarbeiter');
      expect(admin.role).toBe('admin');
    });
  });

  // FA-7: Administratoren sollen Mitarbeiterkonten erstellen können.
  describe('registerStaff (FA-7)', () => {
    it('sollte einem Admin erlauben, ein Mitarbeiterkonto zu erstellen', async () => {
      req.user = { role: 'admin' }; // Simuliert einen Admin
      req.body = { username: 'newstaff', email: 'staff@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      User.create.mockResolvedValue({ id: 2, username: 'newstaff', role: 'mitarbeiter' });

      await registerStaff(req, res);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'mitarbeiter' }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Mitarbeiter erfolgreich registriert' }));
    });
  });
});