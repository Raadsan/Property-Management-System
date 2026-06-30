import express from 'express';
import { createRole, getRoles, getRoleById, updateRole, deleteRole } from '../controllers/roleController.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect, requireStaff);

router.post('/', authorize('/settings/roles', 'add'), createRole);
router.get('/', authorize('/settings/roles', 'view'), getRoles);
router.get('/:id', authorize('/settings/roles', 'view'), getRoleById);
router.patch('/:id', authorize('/settings/roles', 'edit'), updateRole);
router.delete('/:id', authorize('/settings/roles', 'delete'), deleteRole);

export default router;
