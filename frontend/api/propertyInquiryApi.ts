import api from './axios';

export interface PropertyInquiryData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  propertyId: number;
}

export const sendPropertyInquiry = async (inquiryData: PropertyInquiryData) => {
  const response = await api.post('/property-inquiries', inquiryData);
  return response.data;
};

export const getPropertyInquiries = async () => {
  const response = await api.get('/property-inquiries');
  return response.data;
};

export const deletePropertyInquiry = async (id: number) => {
  const response = await api.delete(`/property-inquiries/${id}`);
  return response.data;
};
