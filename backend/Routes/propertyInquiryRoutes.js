import express from "express";
import { createInquiry, getInquiries, deleteInquiry } from "../controllers/PropertyInquiryController.js";
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.post("/", createInquiry);

router.get("/", protect, requireStaff, authorize('/communication/property-inquiry', 'view'), getInquiries);
router.delete("/:id", protect, requireStaff, authorize('/communication/property-inquiry', 'delete'), deleteInquiry);

export default router;
