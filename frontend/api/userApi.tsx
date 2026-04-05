import api from "./axios";

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

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
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
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};
