import express from 'express';
import { 
  syncRolePermissions, 
  getRolePermissions, 
  getRolePermissionsById
} from '../controllers/rolePermissionsController.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect, requireStaff);

router.post('/', authorize('/settings/role-permissions', 'edit'), syncRolePermissions);
router.get('/', authorize('/settings/role-permissions', 'view'), getRolePermissions);
router.get('/:id', authorize('/settings/role-permissions', 'view'), getRolePermissionsById);

export default router;
