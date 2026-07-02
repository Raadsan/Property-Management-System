import api from "./axios";

export interface District {
  id?: number;
  name: string;
  order?: number;
  cityId?: number;
}

export interface City {
  id: number;
  name: string;
  order?: number;
  isDefault?: boolean;
  districts?: District[];
}

export const getCities = async (): Promise<City[]> => {
  const response = await api.get("/cities");
  return response.data;
};

export const getCityById = async (id: number): Promise<City> => {
  const response = await api.get(`/cities/${id}`);
  return response.data;
};

export const createCity = async (data: Partial<City>): Promise<City> => {
  const response = await api.post("/cities", data);
  return response.data.city;
};

export const updateCity = async (id: number, data: Partial<City>): Promise<City> => {
  const response = await api.patch(`/cities/${id}`, data);
  return response.data.city;
};

export const deleteCity = async (id: number): Promise<void> => {
  await api.delete(`/cities/${id}`);
};
