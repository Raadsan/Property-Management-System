import api from "./axios";

export const getTransactionReport = async () => {
  const response = await api.get("/reports/transactions");
  return response.data;
};

export const getPropertyReport = async () => {
  const response = await api.get("/reports/properties");
  return response.data;
};

export const getCategoryReport = async () => {
  const response = await api.get("/reports/categories");
  return response.data;
};

export const getUserActivityReport = async () => {
  const response = await api.get("/reports/users");
  return response.data;
};

export interface BlogReportItem {
  id: number;
  title: string;
  author: string;
  image?: string;
  categoryId: number;
  category?: { id: number; name: string };
  createdBy?: { id: number; name: string };
  createdAt: string;
  _count?: { socials: number };
}

export interface BlogReportData {
  blogs: BlogReportItem[];
  totalBlogs: number;
  totalCategories: number;
  totalAuthors: number;
  publishedThisMonth: number;
  categories: { id: number; name: string; count: number }[];
}

export const getBlogReport = async (): Promise<BlogReportData> => {
  const response = await api.get("/reports/blogs");
  return response.data;
};
