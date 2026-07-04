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

router.get('/:id', (req, res, next) => {
  const requestedId = parseInt(req.params.id, 10);
  const isAdmin = req.user?.role?.name?.toUpperCase() === 'ADMIN';
  const isSelf = req.user?.roleId === requestedId;
  if (isSelf || isAdmin) {
    return getRolePermissionsById(req, res, next);
  }
  return authorize('/settings/role-permissions', 'view')(req, res, next);
});

export default router;
