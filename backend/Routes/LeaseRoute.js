import express from 'express';
import { 
  createLease, 
  getLeases, 
  getLeaseById, 
  updateLease, 
  deleteLease 
} from '../controllers/LeaseController.js';

const router = express.Router();

router.post('/', createLease);
router.get('/', getLeases);
router.get('/:id', getLeaseById);
router.patch('/:id', updateLease);
router.delete('/:id', deleteLease);

export default router;
