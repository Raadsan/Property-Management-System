import express from 'express';
import { 
  createMenu, 
  getMenus, 
  getMenuById, 
  updateMenu, 
  deleteMenu,
  getPermissionMenusByRole
} from '../controllers/menuController.js';
import { protect, requireStaff, requireSelfRoleOrAdmin } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.get('/permissions/:roleId', protect, requireSelfRoleOrAdmin, getPermissionMenusByRole);

router.post('/', protect, requireStaff, authorize('/settings/menu', 'add'), createMenu);
router.get('/', protect, requireStaff, authorize('/settings/menu', 'view'), getMenus);
router.get('/:id', protect, requireStaff, authorize('/settings/menu', 'view'), getMenuById);
router.patch('/:id', protect, requireStaff, authorize('/settings/menu', 'edit'), updateMenu);
router.delete('/:id', protect, requireStaff, authorize('/settings/menu', 'delete'), deleteMenu);

export default router;
