import express from 'express';
import { 
  createProperty, 
  getProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty,
  bookNow,
  getBookingsByUser,
  getCityStats,
  cancelBooking,
  approveProperty
} from '../controllers/PropertyController.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

router.post('/', upload.array('images', 10), createProperty);
router.get('/', getProperties);
router.get('/stats/cities', getCityStats);
router.get('/user/:userId/bookings', getBookingsByUser);
router.get('/:id', getPropertyById);
router.patch('/:id', upload.array('images', 10), updateProperty);
router.patch('/:id/approve', approveProperty);
router.delete('/:id', deleteProperty);
router.post('/:id/book', bookNow);
router.post('/:id/cancel', cancelBooking);

export default router;
