import { prisma } from '../config/db';
import { CreateWatchlistItemInput, UpdateWatchlistItemInput } from '../schemas/watchlist.schema';

export class WatchlistService {
  static async createItem(input: CreateWatchlistItemInput, userId: string) {
    return prisma.watchlistItem.create({
      data: {
        ...input,
        userId,
      },
    });
  }

  static async getItems(userId: string) {
    return prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getItemById(id: string, userId: string, role: string) {
    const item = await prisma.watchlistItem.findUnique({
      where: { id },
    });

    if (!item) {
      const err = new Error('Watchlist item not found') as any;
      err.statusCode = 404;
      throw err;
    }

    // Regular users can only access their own items
    if (role !== 'ADMIN' && item.userId !== userId) {
      const err = new Error('Forbidden. You do not own this item.') as any;
      err.statusCode = 403;
      throw err;
    }

    return item;
  }

  static async updateItem(id: string, input: UpdateWatchlistItemInput, userId: string, role: string) {
    // Check if item exists and user has permission
    await this.getItemById(id, userId, role);

    return prisma.watchlistItem.update({
      where: { id },
      data: input,
    });
  }

  static async deleteItem(id: string, userId: string, role: string) {
    // Check if item exists and user has permission
    await this.getItemById(id, userId, role);

    await prisma.watchlistItem.delete({
      where: { id },
    });

    return { message: 'Watchlist item deleted successfully' };
  }

  // Admin exclusive service method for aggregate metrics dashboard
  static async getAdminStats() {
    const totalUsers = await prisma.user.count();
    const totalItems = await prisma.watchlistItem.count();
    
    const items = await prisma.watchlistItem.findMany({
      select: {
        amount: true,
        purchasePrice: true,
      },
    });

    const totalPortfolioValue = items.reduce((acc, curr) => acc + (curr.amount * curr.purchasePrice), 0);

    const users = await prisma.user.findMany({
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

    const recentWatchlist = await prisma.watchlistItem.findMany({
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
