import api from "./axios";

export interface RoleSubMenuAccess {
  id?: number;
  roleMenuAccessId?: number;
  subMenuId: number;
  subMenu?: { id: number; title: string; url: string };
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canApprove: boolean;
  canGenerate: boolean;
  canLost: boolean;
}

export interface RoleMenuAccess {
  id?: number;
  rolePermissionsId?: number;
  menuId: number;
  menu?: { id: number; title: string; url?: string; isCollapsible: boolean };
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canApprove: boolean;
  canGenerate: boolean;
  canLost: boolean;
  subMenus?: RoleSubMenuAccess[];
}

export interface RolePermissions {
  id?: number;
  roleId: number;
  menus: RoleMenuAccess[];
  role?: { id: number; name: string };
}

export const getRolePermissions = async (): Promise<RolePermissions[]> => {
  const response = await api.get("/role-permissions");
  return response.data;
};

export const getRolePermissionsById = async (roleId: number): Promise<RolePermissions> => {
  const response = await api.get(`/role-permissions/${roleId}`);
  return response.data;
};

export const syncRolePermissions = async (data: { roleId: number; menus: RoleMenuAccess[] }): Promise<RolePermissions> => {
  const response = await api.post("/role-permissions", data);
  return response.data.rolePermissions;
};
