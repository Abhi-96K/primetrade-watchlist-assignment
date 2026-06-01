import { Request, Response, NextFunction } from 'express';
import { WatchlistService } from '../services/watchlist.service';

export class WatchlistController {
  static async createItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await WatchlistService.createItem(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Watchlist item created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await WatchlistService.getItems(userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;
      const result = await WatchlistService.getItemById(id, userId, role);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;
      const result = await WatchlistService.updateItem(id, req.body, userId, role);
      res.status(200).json({
        success: true,
        message: 'Watchlist item updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;
      await WatchlistService.deleteItem(id, userId, role);
      res.status(200).json({
        success: true,
        message: 'Watchlist item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WatchlistService.getAdminStats();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
