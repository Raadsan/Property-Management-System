import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.get('/stats', protect, requireStaff, authorize('/dashboard', 'view'), getDashboardStats);

export default router;
