import express from 'express';
import { 
  getTransactionReport, 
  getPropertyReport, 
  getCategoryReport, 
  getUserActivityReport 
} from '../controllers/reportController.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect, requireStaff);

router.get('/transactions', authorize('/reports', 'view'), getTransactionReport);
router.get('/properties', authorize('/reports', 'view'), getPropertyReport);
router.get('/categories', authorize('/reports', 'view'), getCategoryReport);
router.get('/users', authorize('/reports', 'view'), getUserActivityReport);

export default router;
