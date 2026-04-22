import api from "./axios";

export interface SubMenu {
  id?: number;
  title: string;
  url: string;
  menuId?: number;
}

export interface Menu {
  id: number;
  title: string;
  icon?: string;
  url?: string;
  isCollapsible: boolean;
  subMenus?: SubMenu[];
}

export const getMenus = async (): Promise<Menu[]> => {
  const response = await api.get("/menus");
  return response.data;
};

export const getMenuById = async (id: number): Promise<Menu> => {
  const response = await api.get(`/menus/${id}`);
  return response.data;
};

export const createMenu = async (data: Partial<Menu>): Promise<Menu> => {
  const response = await api.post("/menus", data);
  return response.data.menu;
};

export const updateMenu = async (id: number, data: Partial<Menu>): Promise<Menu> => {
  const response = await api.patch(`/menus/${id}`, data);
  return response.data.menu;
};

export const deleteMenu = async (id: number): Promise<void> => {
  await api.delete(`/menus/${id}`);
};

export const getPermissionMenusByRole = async (roleId: number): Promise<Menu[]> => {
  const response = await api.get(`/menus/permissions/${roleId}`);
  return response.data;
};
