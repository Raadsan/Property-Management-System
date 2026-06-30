import express from 'express';
import { sendContactMessage, createContactAdmin, getContactMessages, updateContactStatus, updateContactPriority, deleteContact } from '../controllers/ContactController.js';
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.post('/', sendContactMessage);

router.post('/admin', protect, requireStaff, authorize('/communication/messages', 'add'), createContactAdmin);
router.get('/', protect, requireStaff, authorize('/communication/messages', 'view'), getContactMessages);
router.put('/:id/status', protect, requireStaff, authorize('/communication/messages', 'edit'), updateContactStatus);
router.put('/:id/priority', protect, requireStaff, authorize('/communication/messages', 'edit'), updateContactPriority);
router.delete('/:id', protect, requireStaff, authorize('/communication/messages', 'delete'), deleteContact);

export default router;
