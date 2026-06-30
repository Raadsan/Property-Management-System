import express from 'express';
import { 
  createUser, getUsers, getUserById, updateUser, deleteUser, loginUser,
  forgotPassword, verifyCode, resetPassword, socialLogin, getMyAccess
} from '../controllers/userController.js';
import { upload } from '../lib/upload.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Public auth routes
router.post('/login', loginUser);
router.post('/social-login', socialLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);
router.post('/', upload.single('image'), createUser);

router.get('/me/access', protect, getMyAccess);

// Protected staff routes
router.get('/', protect, requireStaff, authorize('/settings/users', 'view'), getUsers);
router.get('/:id', protect, requireStaff, authorize('/settings/users', 'view'), getUserById);
router.patch('/:id', protect, requireStaff, authorize('/settings/users', 'edit'), upload.single('image'), updateUser);
router.delete('/:id', protect, requireStaff, authorize('/settings/users', 'delete'), deleteUser);

export default router;
