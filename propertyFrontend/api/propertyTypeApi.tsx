import api from "./axios";

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export const getPropertyTypes = async (): Promise<Category[]> => {
  const response = await api.get("/property-types");
  return response.data;
};

export const getPropertyTypeById = async (id: number): Promise<Category> => {
  const response = await api.get(`/property-types/${id}`);
  return response.data;
};

export const createPropertyType = async (name: string): Promise<Category> => {
  const response = await api.post("/property-types", { name });
  return response.data.propertyType;
};

export const updatePropertyType = async (id: number, name: string): Promise<Category> => {
  const response = await api.patch(`/property-types/${id}`, { name });
  return response.data.propertyType;
};

export const deletePropertyType = async (id: number): Promise<void> => {
  await api.delete(`/property-types/${id}`);
};
