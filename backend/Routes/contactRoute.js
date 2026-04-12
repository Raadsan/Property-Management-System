import express from 'express';
import { sendContactMessage, getContactMessages } from '../controllers/ContactController.js';

const router = express.Router();

router.post('/', sendContactMessage);
router.get('/', getContactMessages);

export default router;
