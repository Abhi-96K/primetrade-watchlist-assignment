"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWatchlistItemSchema = exports.createWatchlistItemSchema = void 0;
const zod_1 = require("zod");
exports.createWatchlistItemSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1, 'Coin/Token Symbol is required').toUpperCase(),
    name: zod_1.z.string().min(1, 'Coin Name is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    purchasePrice: zod_1.z.number().nonnegative('Purchase price cannot be negative'),
    note: zod_1.z.string().max(500, 'Note must not exceed 500 characters').optional().nullable(),
});
exports.updateWatchlistItemSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1).toUpperCase().optional(),
    name: zod_1.z.string().min(1).optional(),
    amount: zod_1.z.number().positive().optional(),
    purchasePrice: zod_1.z.number().nonnegative().optional(),
    note: zod_1.z.string().max(500).optional().nullable(),
});
