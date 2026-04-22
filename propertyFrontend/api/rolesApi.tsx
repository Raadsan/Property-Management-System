import api from "./axios";

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get("/roles");
  return response.data;
};

export const getRoleById = async (id: number): Promise<Role> => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (data: { name: string; description?: string }): Promise<Role> => {
  const response = await api.post("/roles", data);
  return response.data.role; // Extracts properly from { message: "...", role: {...} }
};

export const updateRole = async (id: number, data: { name?: string; description?: string }): Promise<Role> => {
  const response = await api.patch(`/roles/${id}`, data);
  return response.data.role; // Extracts properly from { message: "...", role: {...} }
};

export const deleteRole = async (id: number): Promise<void> => {
  await api.delete(`/roles/${id}`);
};
