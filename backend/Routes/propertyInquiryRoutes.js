import express from "express";
import { createInquiry, getInquiries, deleteInquiry } from "../controllers/PropertyInquiryController.js";

const router = express.Router();

router.post("/", createInquiry);
router.get("/", getInquiries);
router.delete("/:id", deleteInquiry);

export default router;
