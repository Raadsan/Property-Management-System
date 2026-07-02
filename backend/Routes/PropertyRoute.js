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
import { protect, requireStaff, optionalProtect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Public read routes (optional auth so staff can see internal notes)
router.get('/', optionalProtect, getProperties);
router.get('/stats/cities', getCityStats);
router.get('/:id', optionalProtect, getPropertyById);

// Authenticated user actions
router.get('/user/:userId/bookings', protect, getBookingsByUser);
router.post('/:id/book', protect, bookNow);
router.post('/:id/cancel', protect, cancelBooking);

// Staff-only property management
router.post('/', protect, requireStaff, authorize('/content/properties', 'add'), upload.array('images', 30), createProperty);
router.patch('/:id', protect, requireStaff, authorize('/content/properties', 'edit'), upload.array('images', 30), updateProperty);
router.patch('/:id/approve', protect, requireStaff, authorize('/content/properties', 'edit'), approveProperty);
router.delete('/:id', protect, requireStaff, authorize('/content/properties', 'delete'), deleteProperty);

export default router;
