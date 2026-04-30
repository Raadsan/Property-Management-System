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
