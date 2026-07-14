import express from "express";
import { 
  getBlogs, 
  getBlogById, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from "../controllers/BlogController.js";
import { upload } from "../lib/upload.js";
import { protect, requireStaff, optionalProtect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.get("/", optionalProtect, getBlogs);
router.get("/:id", getBlogById);

router.post("/", protect, requireStaff, authorize('/content/blogs', 'add'), upload.single('image'), createBlog);
router.patch("/:id", protect, requireStaff, authorize('/content/blogs', 'edit'), upload.single('image'), updateBlog);
router.delete("/:id", protect, requireStaff, authorize('/content/blogs', 'delete'), deleteBlog);

export default router;
