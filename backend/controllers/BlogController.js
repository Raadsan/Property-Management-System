import { prisma } from "../lib/prisma.js";

// @desc    Get all blogs
// @route   GET /api/blogs
export const getBlogs = async (req, res) => {
  const { categoryId } = req.query;
  
  try {
    const where = {};
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const blogs = await prisma.blog.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error: error.message });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error: error.message });
  }
};

// @desc    Create a new blog
// @route   POST /api/blogs
export const createBlog = async (req, res) => {
  const { title, content, author, categoryId, image } = req.body;

  if (!title || !content || !author || !categoryId) {
    return res.status(400).json({ message: "Missing required fields (title, content, author, categoryId)" });
  }

  try {
    let imagePath = image;
    if (req.file) {
      imagePath = req.file.path; // Multer path
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        author,
        categoryId: parseInt(categoryId),
        image: imagePath
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error creating blog", error: error.message });
  }
};

// @desc    Update a blog
// @route   PATCH /api/blogs/:id
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, author, categoryId, image } = req.body;

  try {
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (author) updateData.author = author;
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    
    if (req.file) {
      updateData.image = req.file.path;
    } else if (image) {
      updateData.image = image;
    }

    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error: error.message });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.blog.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
};
