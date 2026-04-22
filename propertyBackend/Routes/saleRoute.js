import express from 'express';
import { 
  createSale, 
  getSales, 
  getSaleById, 
  updateSale, 
  deleteSale 
} from '../controllers/saleController.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

// Allow single file upload for 'document' field
router.post('/', upload.single('document'), createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.patch('/:id', upload.single('document'), updateSale);
router.delete('/:id', deleteSale);

export default router;
