// Unit-Tests für userController (Jest)

import {
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
} from './userController.js';

import User from '../models/User.js';

// Sequelize-Mock
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

jest.mock('../models/User.js', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findAll : jest.fn(),
    destroy : jest.fn(),
    save    : jest.fn(),
  },
}));


describe('User Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: 1, role: 'user' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMe', () => {
    it('liefert eigenes Profil', async () => {
      const me = { id: 1, username: 'test' };
      User.findByPk.mockResolvedValue(me);

      await getMe(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1, { attributes: { exclude: ['password'] } });
      expect(res.json).toHaveBeenCalledWith(me);
    });

    it('gibt 404 zurück, wenn Nutzer fehlt', async () => {
      User.findByPk.mockResolvedValue(null);

      await getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Benutzer nicht gefunden.' });
    });
  });

  describe('getAllUsers', () => {
    it('liefert alle Nutzer', async () => {
      const all = [{ id: 1 }, { id: 2 }];
      User.findAll.mockResolvedValue(all);

      await getAllUsers(req, res);

      expect(User.findAll).toHaveBeenCalledWith({ attributes: { exclude: ['password'] } });
      expect(res.json).toHaveBeenCalledWith(all);
    });
  });

  describe('updateUser', () => {
    it('aktualisiert Nutzer (Admin)', async () => {
      req.user.role = 'admin';
      const user = { id: 2, username: 'alt', role: 'user', save: jest.fn(), email: 'alt@ex' };
      User.findByPk.mockResolvedValue(user);
      req.params.id = 2;
      req.body = { username: 'neu', role: 'staff' };

      await updateUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(2);
      expect(user.username).toBe('neu');
      expect(user.role).toBe('staff');
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Benutzer erfolgreich aktualisiert.',
        user: { id: 2, username: 'neu', email: 'alt@ex', role: 'staff' },
      });
    });

    it('verweigert Update durch anderen Nutzer', async () => {
      req.params.id = 2;
      const user = { id: 2, username: 'alt', role: 'user', save: jest.fn() };
      User.findByPk.mockResolvedValue(user);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Keine Berechtigung, diesen Nutzer zu ändern.' });
    });
  });

  describe('deleteUser', () => {
    it('löscht Nutzer (Admin)', async () => {
      req.user.role = 'admin';
      const user = { id: 2, destroy: jest.fn() };
      User.findByPk.mockResolvedValue(user);
      req.params.id = 2;

      await deleteUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(2);
      expect(user.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Benutzer erfolgreich gelöscht.' });
    });

    it('verweigert Löschen durch anderen Nutzer', async () => {
      const user = { id: 2, destroy: jest.fn() };
      User.findByPk.mockResolvedValue(user);
      req.params.id = 2;

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Keine Berechtigung, diesen Nutzer zu löschen.' });
    });
  });
});
