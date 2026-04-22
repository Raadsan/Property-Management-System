import { prisma } from "../lib/prisma.js";

// @desc    Get all blog categories
// @route   GET /api/blog-categories
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { blogs: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog categories", error: error.message });
  }
};

// @desc    Create a blog category
// @route   POST /api/blog-categories
export const createBlogCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });

  try {
    const category = await prisma.blogCategory.create({
      data: { name, description }
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Error creating blog category", error: error.message });
  }
};

// @desc    Update a blog category
// @route   PATCH /api/blog-categories/:id
export const updateBlogCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const category = await prisma.blogCategory.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.status(200).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: "Error updating blog category", error: error.message });
  }
};

// @desc    Delete a blog category
// @route   DELETE /api/blog-categories/:id
export const deleteBlogCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.blogCategory.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
};
