import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlist.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { createWatchlistItemSchema, updateWatchlistItemSchema } from '../schemas/watchlist.schema';

const router = Router();

// All watchlist routes require prior JWT token verification
router.use(authenticate);

router.post('/', validate(createWatchlistItemSchema), WatchlistController.createItem);
router.get('/', WatchlistController.getItems);

// Admin-only stats endpoint. Placing before '/:id' to avoid router clash
router.get('/admin/stats', authorize(['ADMIN']), WatchlistController.getAdminStats);

router.get('/:id', WatchlistController.getItemById);
router.put('/:id', validate(updateWatchlistItemSchema), WatchlistController.updateItem);
router.delete('/:id', WatchlistController.deleteItem);

export default router;
