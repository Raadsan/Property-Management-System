import express from 'express';
import { 
  createPayment, 
  getPayments, 
  getPaymentById, 
  updatePayment, 
  deletePayment 
} from '../controllers/paymentController.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect, requireStaff);

router.post('/', authorize('/settings/payments', 'add'), createPayment);
router.get('/', authorize('/settings/payments', 'view'), getPayments);
router.get('/:id', authorize('/settings/payments', 'view'), getPaymentById);
router.patch('/:id', authorize('/settings/payments', 'edit'), updatePayment);
router.delete('/:id', authorize('/settings/payments', 'delete'), deletePayment);

export default router;
