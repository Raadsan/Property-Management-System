import express from "express";
import { 
  getBlogs, 
  getBlogById, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from "../controllers/BlogController.js";
import { upload } from "../lib/upload.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", upload.single('image'), createBlog);
router.patch("/:id", upload.single('image'), updateBlog);
router.delete("/:id", deleteBlog);

export default router;
