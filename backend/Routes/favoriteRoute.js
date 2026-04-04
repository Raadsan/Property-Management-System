import express from 'express';
import { toggleFavorite, getUserFavorites, checkFavorite } from '../controllers/favoriteController.js';

const router = express.Router();

router.post('/toggle', toggleFavorite);
router.get('/user/:userId', getUserFavorites);
router.get('/check/:userId/:propertyId', checkFavorite);

export default router;
