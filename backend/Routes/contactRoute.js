import express from 'express';
import { sendContactMessage, getContactMessages, updateContactStatus } from '../controllers/ContactController.js';

const router = express.Router();

router.post('/', sendContactMessage);
router.get('/', getContactMessages);
router.put('/:id/status', updateContactStatus);

export default router;
