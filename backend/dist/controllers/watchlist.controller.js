"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistController = void 0;
const watchlist_service_1 = require("../services/watchlist.service");
class WatchlistController {
    static async createItem(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await watchlist_service_1.WatchlistService.createItem(req.body, userId);
            res.status(201).json({
                success: true,
                message: 'Watchlist item created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getItems(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await watchlist_service_1.WatchlistService.getItems(userId);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getItemById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const role = req.user.role;
            const result = await watchlist_service_1.WatchlistService.getItemById(id, userId, role);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateItem(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const role = req.user.role;
            const result = await watchlist_service_1.WatchlistService.updateItem(id, req.body, userId, role);
            res.status(200).json({
                success: true,
                message: 'Watchlist item updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteItem(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const role = req.user.role;
            await watchlist_service_1.WatchlistService.deleteItem(id, userId, role);
            res.status(200).json({
                success: true,
                message: 'Watchlist item deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminStats(req, res, next) {
        try {
            const result = await watchlist_service_1.WatchlistService.getAdminStats();
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const requesterId = req.user.id;
            if (role !== 'USER' && role !== 'ADMIN') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid role. Must be USER or ADMIN.',
                });
                return;
            }
            const result = await watchlist_service_1.WatchlistService.updateUserRole(id, role, requesterId);
            res.status(200).json({
                success: true,
                message: `User role updated successfully to ${role}`,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WatchlistController = WatchlistController;
