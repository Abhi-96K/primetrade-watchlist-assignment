"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistService = void 0;
const db_1 = require("../config/db");
class WatchlistService {
    static async createItem(input, userId) {
        return db_1.prisma.watchlistItem.create({
            data: {
                ...input,
                userId,
            },
        });
    }
    static async getItems(userId) {
        return db_1.prisma.watchlistItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getItemById(id, userId, role) {
        const item = await db_1.prisma.watchlistItem.findUnique({
            where: { id },
        });
        if (!item) {
            const err = new Error('Watchlist item not found');
            err.statusCode = 404;
            throw err;
        }
        // Regular users can only access their own items
        if (role !== 'ADMIN' && item.userId !== userId) {
            const err = new Error('Forbidden. You do not own this item.');
            err.statusCode = 403;
            throw err;
        }
        return item;
    }
    static async updateItem(id, input, userId, role) {
        // Check if item exists and user has permission
        await this.getItemById(id, userId, role);
        return db_1.prisma.watchlistItem.update({
            where: { id },
            data: input,
        });
    }
    static async deleteItem(id, userId, role) {
        // Check if item exists and user has permission
        await this.getItemById(id, userId, role);
        await db_1.prisma.watchlistItem.delete({
            where: { id },
        });
        return { message: 'Watchlist item deleted successfully' };
    }
    // Admin exclusive service method for aggregate metrics dashboard
    static async getAdminStats() {
        const totalUsers = await db_1.prisma.user.count();
        const totalItems = await db_1.prisma.watchlistItem.count();
        const items = await db_1.prisma.watchlistItem.findMany({
            select: {
                amount: true,
                purchasePrice: true,
            },
        });
        const totalPortfolioValue = items.reduce((acc, curr) => acc + (curr.amount * curr.purchasePrice), 0);
        const users = await db_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { watchlist: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const recentWatchlist = await db_1.prisma.watchlistItem.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        });
        return {
            totalUsers,
            totalItems,
            totalPortfolioValue,
            users,
            recentWatchlist,
        };
    }
}
exports.WatchlistService = WatchlistService;
