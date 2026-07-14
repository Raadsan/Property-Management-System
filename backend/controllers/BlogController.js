import { prisma } from "../lib/prisma.js";
import { getFileUrl, rejectLegacyUploadUrl } from "../lib/upload.js";

const parseSocials = (value) => {
  if (!value) return [];
  const socials = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(socials)) throw new Error('Social media links must be an array');

  return socials
    .filter((social) => social?.platform?.trim() && social?.url?.trim())
    .map((social) => {
      let url;
      try {
        url = new URL(social.url.trim());
      } catch {
        throw new Error(`Social media URL for ${social.platform.trim()} is invalid`);
      }
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Social media URLs must use http or https');
      return { platform: social.platform.trim(), url: url.toString() };
    });
};

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
        socials: true,
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
        socials: true,
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
  const { title, content, author, categoryId, image, socials } = req.body;

  if (!title || !content || !author || !categoryId) {
    return res.status(400).json({ message: "Missing required fields (title, content, author, categoryId)" });
  }

  try {
    const socialLinks = parseSocials(socials);
    let imagePath = null;
    if (req.file) {
      imagePath = getFileUrl(req.file);
    } else if (image) {
      if (rejectLegacyUploadUrl(image, res, 'image')) return;
      imagePath = image;
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        author,
        socials: { create: socialLinks },
        categoryId: parseInt(categoryId),
        image: imagePath
      },
      include: {
        socials: true,
        category: {
          select: { name: true }
        }
      }
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(error instanceof SyntaxError || error.message?.startsWith('Social media') ? 400 : 500).json({ message: "Error creating blog", error: error.message });
  }
};

// @desc    Update a blog
// @route   PATCH /api/blogs/:id
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, author, categoryId, image, socials } = req.body;

  try {
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (author) updateData.author = author;
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    if (Object.prototype.hasOwnProperty.call(req.body, 'socials')) {
      updateData.socials = { deleteMany: {}, create: parseSocials(socials) };
    }
    
    if (req.file) {
      updateData.image = getFileUrl(req.file);
    } else if (image) {
      if (rejectLegacyUploadUrl(image, res, 'image')) return;
      updateData.image = image;
    }

    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        socials: true,
        category: {
          select: { name: true }
        }
      }
    });
    res.status(200).json(blog);
  } catch (error) {
    res.status(error instanceof SyntaxError || error.message?.startsWith('Social media') ? 400 : 500).json({ message: "Error updating blog", error: error.message });
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
