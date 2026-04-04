import express from 'express';
import { 
  createPropertyType, 
  getPropertyTypes, 
  getPropertyTypeById, 
  updatePropertyType, 
  deletePropertyType 
} from '../controllers/propertyTypeController.js';

const router = express.Router();

router.post('/', createPropertyType);
router.get('/', getPropertyTypes);
router.get('/:id', getPropertyTypeById);
router.patch('/:id', updatePropertyType);
router.delete('/:id', deletePropertyType);

export default router;
