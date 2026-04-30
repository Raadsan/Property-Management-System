import express from 'express';
import { 
  syncRolePermissions, 
  getRolePermissions, 
  getRolePermissionsById
} from '../controllers/rolePermissionsController.js';

const router = express.Router();

// Assign or update bulk permissions for a role
router.post('/', syncRolePermissions);

// Retrieve existing permission sets
router.get('/', getRolePermissions);
router.get('/:id', getRolePermissionsById);

export default router;
