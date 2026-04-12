import api from './axios';

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

export const sendContactMessage = async (contactData: ContactData) => {
  const response = await api.post('/contact', contactData);
  return response.data;
};
