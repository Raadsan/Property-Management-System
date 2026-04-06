import api from "./axios";
import { Property } from "./propertyApi";
import { User } from "./userApi";

export interface Lease {
  id: number;
  propertyId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  tenant?: User;
}

export interface CreateLeaseData {
  propertyId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
}

export const getLeases = async (): Promise<Lease[]> => {
  const response = await api.get("/leases");
  return response.data;
};

export const getLeaseById = async (id: number): Promise<Lease> => {
  const response = await api.get(`/leases/${id}`);
  return response.data;
};

export const createLease = async (data: CreateLeaseData): Promise<Lease> => {
  const response = await api.post("/leases", data);
  return response.data.lease;
};

export const updateLease = async (id: number, data: Partial<CreateLeaseData>): Promise<Lease> => {
  const response = await api.patch(`/leases/${id}`, data);
  return response.data.lease;
};

export const deleteLease = async (id: number): Promise<void> => {
  await api.delete(`/leases/${id}`);
};
