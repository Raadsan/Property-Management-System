import express from 'express';
import { 
  createUser, getUsers, getUserById, updateUser, deleteUser, loginUser,
  forgotPassword, verifyCode, resetPassword 
} from '../controllers/userController.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/social-login', socialLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);
router.post('/', upload.single('image'), createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id', upload.single('image'), updateUser);
router.delete('/:id', deleteUser);

export default router;
