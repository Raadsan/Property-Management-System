import express from 'express';
import { 
  createPropertyType, 
  getPropertyTypes, 
  getPropertyTypeById, 
  updatePropertyType, 
  deletePropertyType 
} from '../controllers/propertyTypeController.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.get('/', getPropertyTypes);
router.get('/:id', getPropertyTypeById);

router.post('/', protect, requireStaff, authorize('/content/categories', 'add'), createPropertyType);
router.patch('/:id', protect, requireStaff, authorize('/content/categories', 'edit'), updatePropertyType);
router.delete('/:id', protect, requireStaff, authorize('/content/categories', 'delete'), deletePropertyType);

export default router;
