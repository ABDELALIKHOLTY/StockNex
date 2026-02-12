"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const bcrypt_1 = require("bcrypt");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Admin auth middleware
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'You do not have admin access' });
    }
    next();
};
// Get all users with their watchlist and predictions
router.get('/users', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                watchlistItems: true,
                predictions: true,
                activityLogs: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Remove passwords from response
        const safeUsers = users.map(({ password, ...user }) => user);
        res.json(safeUsers);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Get specific user with all details
router.get('/users/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                watchlistItems: true,
                predictions: true,
                activityLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 50,
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Remove password
        const { password, ...safeUser } = user;
        res.json(safeUser);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
// Get user statistics
router.get('/users/:id/stats', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get watchlist items
        const watchlist = await prisma.watchlistItem.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' },
        });
        // Get predictions
        const predictions = await prisma.userPrediction.findMany({
            where: { userId },
            orderBy: { viewedAt: 'desc' },
        });
        // Get activity logs count
        const logsCount = await prisma.activityLog.count({
            where: { userId },
        });
        res.json({
            userId,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount,
            isAdmin: user.isAdmin,
            watchlist,
            predictions,
            watchlistCount: watchlist.length,
            predictionsCount: predictions.length,
            logsCount,
        });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});
// Create a new user (Admin only)
router.post('/users', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                isAdmin: false,
            },
        });
        const { password: _password, ...safeUser } = user;
        res.status(201).json(safeUser);
    }
    catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email or username already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// Toggle admin status for a user
router.put('/users/:id/admin-status', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isAdmin: !user.isAdmin,
            },
        });
        const { password: _password, ...safeUser } = updatedUser;
        res.json(safeUser);
    }
    catch (error) {
        console.error('Error updating user admin status:', error);
        res.status(500).json({ error: 'Failed to update user admin status' });
    }
});
// Delete a user (Admin only)
router.delete('/users/:id', auth_1.authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const requestUser = req.user;
        // Prevent admin from deleting themselves
        if (requestUser && requestUser.id === userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Delete related data first
        await prisma.activityLog.deleteMany({
            where: { userId },
        });
        await prisma.userPrediction.deleteMany({
            where: { userId },
        });
        await prisma.watchlistItem.deleteMany({
            where: { userId },
        });
        // Delete the user
        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });
        const { password: _password, ...safeUser } = deletedUser;
        res.json({ message: 'User deleted successfully', user: safeUser });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
exports.default = router;
