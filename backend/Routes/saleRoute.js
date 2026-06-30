import express from 'express';
import { 
  createSale, 
  getSales, 
  getSaleById, 
  updateSale, 
  deleteSale 
} from '../controllers/saleController.js';
import { upload } from '../lib/upload.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect, requireStaff);

router.post('/', authorize('/content/sales', 'add'), upload.single('document'), createSale);
router.get('/', authorize('/content/sales', 'view'), getSales);
router.get('/:id', authorize('/content/sales', 'view'), getSaleById);
router.patch('/:id', authorize('/content/sales', 'edit'), upload.single('document'), updateSale);
router.delete('/:id', authorize('/content/sales', 'delete'), deleteSale);

export default router;
