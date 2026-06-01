import { Router } from 'express';
import authRoutes from './auth.routes';
import watchlistRoutes from './watchlist.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/watchlist', watchlistRoutes);

export default router;
