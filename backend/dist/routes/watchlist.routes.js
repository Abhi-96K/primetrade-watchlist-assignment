"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const watchlist_controller_1 = require("../controllers/watchlist.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const watchlist_schema_1 = require("../schemas/watchlist.schema");
const router = (0, express_1.Router)();
// All watchlist routes require prior JWT token verification
router.use(authMiddleware_1.authenticate);
router.post('/', (0, validationMiddleware_1.validate)(watchlist_schema_1.createWatchlistItemSchema), watchlist_controller_1.WatchlistController.createItem);
router.get('/', watchlist_controller_1.WatchlistController.getItems);
// Admin-only stats endpoint. Placing before '/:id' to avoid router clash
router.get('/admin/stats', (0, roleMiddleware_1.authorize)(['ADMIN']), watchlist_controller_1.WatchlistController.getAdminStats);
router.get('/:id', watchlist_controller_1.WatchlistController.getItemById);
router.put('/:id', (0, validationMiddleware_1.validate)(watchlist_schema_1.updateWatchlistItemSchema), watchlist_controller_1.WatchlistController.updateItem);
router.delete('/:id', watchlist_controller_1.WatchlistController.deleteItem);
exports.default = router;
