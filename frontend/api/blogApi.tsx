import api from "./axios";
import { slugify } from "@/lib/slugify";

export interface BlogCategory {
  id: number;
  name: string;
  description?: string;
  _count?: {
    blogs: number;
  };
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  image?: string;
  author: string;
  categoryId: number;
  category: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getBlogs = async (categoryId?: number): Promise<Blog[]> => {
  const params = categoryId ? { categoryId } : {};
  const response = await api.get("/blogs", { params });
  return response.data;
};

export const getBlogById = async (id: number): Promise<Blog> => {
  const response = await api.get(`/blogs/${id}`);
  return response.data;
};

/** Resolve blog by slugified title or numeric id (legacy links) */
export const getBlogBySlug = async (slug: string): Promise<Blog> => {
  if (/^\d+$/.test(slug.trim())) {
    const numericId = parseInt(slug, 10);
    return getBlogById(numericId);
  }

  const blogs = await getBlogs();
  const normalized = slug.toLowerCase();
  const found = blogs.find(
    (blog) => slugify(blog.title) === normalized || slugify(blog.title) === slugify(slug)
  );

  if (!found) {
    throw new Error("Blog not found");
  }

  return getBlogById(found.id);
};

export function getBlogUrl(blog: Pick<Blog, "id" | "title">) {
  return `/blogs/${slugify(blog.title)}`;
}

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  const response = await api.get("/blog-categories");
  return response.data;
};

export const createBlog = async (formData: FormData): Promise<Blog> => {
  const response = await api.post("/blogs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateBlog = async (id: number, formData: FormData): Promise<Blog> => {
  const response = await api.patch(`/blogs/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteBlog = async (id: number): Promise<void> => {
  await api.delete(`/blogs/${id}`);
};
