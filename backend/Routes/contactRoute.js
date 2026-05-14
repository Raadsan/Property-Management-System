import express from 'express';
import { sendContactMessage, getContactMessages, updateContactStatus, updateContactPriority, deleteContact } from '../controllers/ContactController.js';

const router = express.Router();

router.post('/', sendContactMessage);
router.get('/', getContactMessages);
router.put('/:id/status', updateContactStatus);
router.put('/:id/priority', updateContactPriority);
router.delete('/:id', deleteContact);

export default router;
