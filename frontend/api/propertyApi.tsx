import api from "./axios";

export interface PropertyImage {
  id: number;
  url: string;
  propertyId: number;
}

export interface PropertyFeature {
  id: number;
  name: string;
  propertyId: number;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  location: string;
  city: string;
  price: number;
  listingType: 'RENT' | 'SALE';
  status: 'AVAILABLE' | 'BOOKED' | 'SOLD' | 'RENTED';
  sizeLabel?: string;
  area?: number;
  Rooms?: number;
  Bathrooms?: number;
  ReservationFee?: number;
  ownerId: number;
  propertyTypeId: number;
  createdAt: string;
  updatedAt: string;

  images?: PropertyImage[];
  features?: PropertyFeature[];
  propertyType?: { name: string };
  owner?: { name: string; phone: string; email?: string; photo?: string };
}

export const getProperties = async (): Promise<Property[]> => {
  const response = await api.get("/properties");
  return response.data;
};

export const getPropertyById = async (id: number): Promise<Property> => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const bookProperty = async (id: number, data: { userId: number, phone: string }): Promise<any> => {
  const response = await api.post(`/properties/${id}/book`, data);
  return response.data;
};

// Uses FormData to support image uploads alongside standard HTTP fields
export const createProperty = async (data: FormData): Promise<Property> => {
  const response = await api.post("/properties", data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.property; // Extracts from { message: "...", property: {...} }
};

// Uses FormData to support image replacement alongside standard HTTP fields
export const updateProperty = async (id: number, data: FormData): Promise<Property> => {
  const response = await api.patch(`/properties/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.property; // Extracts from { message: "...", property: {...} }
};

export const deleteProperty = async (id: number): Promise<void> => {
  await api.delete(`/properties/${id}`);
};

export const getCityStats = async (): Promise<{ name: string; listings: number }[]> => {
  const response = await api.get("/properties/stats/cities");
  return response.data;
};

export const getPropertyTypes = async (): Promise<{ id: number; name: string }[]> => {
  const response = await api.get("/property-types");
  return response.data;
};
