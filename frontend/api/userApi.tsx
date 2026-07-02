import api from "./axios";
import type { Menu } from "./menuApi";

export interface User {
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  roleId: number;
  photo?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  role?: {
    name: string;
  };
}

export const getUsers = async (params?: { role?: string }): Promise<User[]> => {
  const response = await api.get("/users", { params });
  return response.data;
};

/** Active users with a given role — for property/sale/lease forms (no Users menu permission needed) */
export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await api.get(`/users/by-role/${encodeURIComponent(role)}`);
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export interface CreateUserData {
  name: string;
  email?: string;
  phone: string;
  roleId: number;
  password?: string;
  photo?: string;
  status?: string;
}

export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await api.post("/users", data);
  return response.data.user; // Extract from { message: "...", user: {...} }
};

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  password?: string; // If left empty, avoid sending it for updates
  photo?: string;
  status?: string;
}

export const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data.user; // Extract from { message: "...", user: {...} }
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  menus?: Menu[];
  permissions?: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }>;
}

export interface UserAccess {
  roleId: number;
  roleName: string | null;
  isAdmin: boolean;
  menus: Menu[];
  permissions: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }>;
}

export const getMyAccess = async (): Promise<UserAccess> => {
  const response = await api.get("/users/me/access");
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};

// --- Forgot Password API ---

export const forgotPassword = async (email: string) => {
  const response = await api.post("/users/forgot-password", { email });
  return response.data;
};

export const verifyResetCode = async (email: string, code: string) => {
  const response = await api.post("/users/verify-code", { email, code });
  return response.data;
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const response = await api.post("/users/reset-password", { email, code, newPassword });
  return response.data;
};

export const socialLogin = async (idToken: string): Promise<LoginResponse> => {
  const response = await api.post("/users/social-login", { idToken });
  return response.data;
};
