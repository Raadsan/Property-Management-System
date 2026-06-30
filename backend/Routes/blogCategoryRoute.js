import express from "express";
import { 
  getBlogCategories, 
  createBlogCategory, 
  updateBlogCategory,
  deleteBlogCategory 
} from "../controllers/BlogCategoryController.js";
import { protect, requireStaff } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.get("/", getBlogCategories);

router.post("/", protect, requireStaff, authorize('/content/blog-categories', 'add'), createBlogCategory);
router.patch("/:id", protect, requireStaff, authorize('/content/blog-categories', 'edit'), updateBlogCategory);
router.delete("/:id", protect, requireStaff, authorize('/content/blog-categories', 'delete'), deleteBlogCategory);

export default router;
