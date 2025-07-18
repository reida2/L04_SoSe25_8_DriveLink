// Backend/controllers/userController.test.js

import {
    getMe,
    getAllUsers,
    updateUser,
    deleteUser,
} from './userController.js';

import User from '../models/User.js';

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

jest.mock('../models/User.js', () => ({
    __esModule: true,
    default: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn(),
        save: jest.fn(),
    }
}));


describe('User Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
            user: { id: 1, role: 'user' },
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMe', () => {
        it('should get the current user\'s profile', async () => {
            const mockUser = { id: 1, username: 'testuser' };
            User.findByPk.mockResolvedValue(mockUser);

            await getMe(mockReq, mockRes);

            expect(User.findByPk).toHaveBeenCalledWith(1, { attributes: { exclude: ['password'] } });
            expect(mockRes.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 if user not found', async () => {
            User.findByPk.mockResolvedValue(null);

            await getMe(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('getAllUsers', () => {
        it('should get all users', async () => {
            const mockUsers = [{ id: 1 }, { id: 2 }];
            User.findAll.mockResolvedValue(mockUsers);

            await getAllUsers(mockReq, mockRes);

            expect(User.findAll).toHaveBeenCalledWith({ attributes: { exclude: ['password'] } });
            expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully by admin', async () => {
            mockReq.user.role = 'admin';
            const mockUser = { id: 2, username: 'olduser', role: 'user', save: jest.fn(), email: 'old@test.com' };
            User.findByPk.mockResolvedValue(mockUser);
            mockReq.params.id = 2;
            mockReq.body = { username: 'newuser', role: 'staff' };

            await updateUser(mockReq, mockRes);

            expect(User.findByPk).toHaveBeenCalledWith(2);
            expect(mockUser.username).toBe('newuser');
            expect(mockUser.role).toBe('staff');
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User updated successfully', user: { id: 2, username: 'newuser', email: 'old@test.com', role: 'staff' } });
        });

        it('should not allow a user to update another user', async () => {
            mockReq.params.id = 2;
            const mockUser = { id: 2, username: 'olduser', role: 'user', save: jest.fn() };
            User.findByPk.mockResolvedValue(mockUser);


            await updateUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized to update this user' });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully by admin', async () => {
            mockReq.user.role = 'admin';
            const mockUser = { id: 2, destroy: jest.fn() };
            User.findByPk.mockResolvedValue(mockUser);
            mockReq.params.id = 2;

            await deleteUser(mockReq, mockRes);

            expect(User.findByPk).toHaveBeenCalledWith(2);
            expect(mockUser.destroy).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });

        it('should not allow a user to delete another user', async () => {
            const mockUser = { id: 2, destroy: jest.fn() };
            User.findByPk.mockResolvedValue(mockUser);
            mockReq.params.id = 2;

            await deleteUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this user' });
        });
    });
});
