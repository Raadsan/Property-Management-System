import express from 'express';
import { 
  createProperty, 
  getProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty 
} from '../controllers/PropertyController.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

router.post('/', upload.array('images', 10), createProperty);
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.patch('/:id', upload.array('images', 10), updateProperty);
router.delete('/:id', deleteProperty);

export default router;
