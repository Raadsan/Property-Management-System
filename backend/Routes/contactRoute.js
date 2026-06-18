import express from 'express';
import { sendContactMessage, createContactAdmin, getContactMessages, updateContactStatus, updateContactPriority, deleteContact } from '../controllers/ContactController.js';

const router = express.Router();

router.post('/', sendContactMessage);
router.post('/admin', createContactAdmin);
router.get('/', getContactMessages);
router.put('/:id/status', updateContactStatus);
router.put('/:id/priority', updateContactPriority);
router.delete('/:id', deleteContact);

export default router;
