import api from "./axios";
import { Property } from "./propertyApi";
import { User } from "./userApi";

export interface Sale {
  id: number;
  propertyId: number;
  buyerId: number;
  price: number;
  documentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  buyer?: User;
}

export interface CreateSaleData {
  propertyId: number;
  buyerId: number;
  price: number;
  document?: File;
}

export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get("/sales");
  return response.data;
};

export const getSaleById = async (id: number): Promise<Sale> => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

export const createSale = async (data: FormData): Promise<Sale> => {
  const response = await api.post("/sales", data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.sale;
};

export const updateSale = async (id: number, data: FormData): Promise<Sale> => {
  const response = await api.patch(`/sales/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.sale;
};

export const deleteSale = async (id: number): Promise<void> => {
  await api.delete(`/sales/${id}`);
};
