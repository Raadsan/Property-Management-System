import api from "./axios";

export interface Video {
  id: number;
  title: string;
  description?: string;
  location: string;
  city: string;
  country?: string;
  price: number;
  Rooms: number;
  Bathrooms: number;
  ReservationFee: number;
  listingType: string;
  status: string;
  sizeLabel?: string;
  area?: number;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  agentId?: number;
  propertyTypeId: number;
  propertyType?: { name: string };
  owner?: { name: string, phone: string };
  agent?: { name: string, phone: string };
}

export const getVideos = async (): Promise<Video[]> => {
  const response = await api.get("/videos");
  return response.data;
};

export const createVideo = async (formData: FormData): Promise<Video> => {
  const response = await api.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.video;
};

export const updateVideo = async (id: number, formData: FormData): Promise<Video> => {
  const response = await api.patch(`/videos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.video;
};

export const deleteVideo = async (id: number): Promise<void> => {
  await api.delete(`/videos/${id}`);
};
