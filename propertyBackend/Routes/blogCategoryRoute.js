import express from "express";
import { 
  getBlogCategories, 
  createBlogCategory, 
  updateBlogCategory,
  deleteBlogCategory 
} from "../controllers/BlogCategoryController.js";

const router = express.Router();

router.get("/", getBlogCategories);
router.post("/", createBlogCategory);
router.patch("/:id", updateBlogCategory);
router.delete("/:id", deleteBlogCategory);

export default router;
