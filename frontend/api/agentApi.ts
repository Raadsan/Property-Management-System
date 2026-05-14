import api from './axios';

export interface AgentData {
  id?: number;
  fullName: string;
  email: string;
  primaryPhone: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  roleId: number;
  status: string;
  password?: string;
  role?: {
    id: number;
    name: string;
  };
}

export const getAgents = async () => {
  const response = await api.get('/agents');
  return response.data;
};

export const getAgentById = async (id: number) => {
  const response = await api.get(`/agents/${id}`);
  return response.data;
};

export const createAgent = async (agentData: AgentData) => {
  const response = await api.post('/agents', agentData);
  return response.data;
};

export const updateAgent = async (id: number, agentData: Partial<AgentData>) => {
  const response = await api.put(`/agents/${id}`, agentData);
  return response.data;
};

export const deleteAgent = async (id: number) => {
  const response = await api.delete(`/agents/${id}`);
  return response.data;
};
