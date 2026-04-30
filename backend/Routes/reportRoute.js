import express from 'express';
import { 
  getTransactionReport, 
  getPropertyReport, 
  getCategoryReport, 
  getUserActivityReport 
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/transactions', getTransactionReport);
router.get('/properties', getPropertyReport);
router.get('/categories', getCategoryReport);
router.get('/users', getUserActivityReport);

export default router;
