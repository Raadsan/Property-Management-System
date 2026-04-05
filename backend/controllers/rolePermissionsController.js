import { prisma } from "../lib/prisma.js";

// @desc    Assign or Update Permissions for a specific Role
// @route   POST /api/role-permissions
export const syncRolePermissions = async (req, res) => {
  const { roleId, menus } = req.body;
  if (!roleId) return res.status(400).json({ message: "Role ID is required" });

  try {
    // Instead of complex conditional updates, we wipe existing permissions for the role and recreate them
    let existingPerms = await prisma.rolePermissions.findUnique({
      where: { roleId: parseInt(roleId) }
    });

    if (existingPerms) {
      await prisma.rolePermissions.delete({ where: { roleId: parseInt(roleId) } });
    }

    // Build the deeply nested structure mapping Menus to SubMenus
    const permissionsData = {
      roleId: parseInt(roleId),
      menus: {
        create: menus?.map(menuItem => ({
          menuId: parseInt(menuItem.menuId),
          canView: menuItem.canView || false,
          canAdd: menuItem.canAdd || false,
          canEdit: menuItem.canEdit || false,
          canDelete: menuItem.canDelete || false,
          canAssign: menuItem.canAssign || false,
          canApprove: menuItem.canApprove || false,
          canGenerate: menuItem.canGenerate || false,
          canLost: menuItem.canLost || false,
          subMenus: {
            create: menuItem.subMenus?.map(sm => ({
              subMenuId: parseInt(sm.subMenuId),
              canView: sm.canView || false,
              canAdd: sm.canAdd || false,
              canEdit: sm.canEdit || false,
              canDelete: sm.canDelete || false,
              canAssign: sm.canAssign || false,
              canApprove: sm.canApprove || false,
              canGenerate: sm.canGenerate || false,
              canLost: sm.canLost || false,
            })) || []
          }
        })) || []
      }
    };

    const rolePerms = await prisma.rolePermissions.create({
      data: permissionsData,
      include: {
        menus: {
          include: { subMenus: true }
        }
      }
    });

    res.status(200).json({ message: "Role permissions synchronized successfully", rolePermissions: rolePerms });
  } catch (error) {
    res.status(500).json({ message: "Error syncing role permissions", error: error.message });
  }
};

// @desc    Get all Role Permissions maps
// @route   GET /api/role-permissions
export const getRolePermissions = async (req, res) => {
  try {
    const list = await prisma.rolePermissions.findMany({
      include: {
        role: { select: { id: true, name: true } },
        menus: {
          include: { 
            menu: true, 
            subMenus: { include: { subMenu: true } } 
          }
        }
      }
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching role permissions", error: error.message });
  }
};

// @desc    Get Role Permissions by Role ID
// @route   GET /api/role-permissions/:id
export const getRolePermissionsById = async (req, res) => {
  const { id } = req.params;
  try {
    const rolePerms = await prisma.rolePermissions.findUnique({
      where: { roleId: parseInt(id) },
      include: {
        menus: {
          include: { 
            menu: true, 
            subMenus: { include: { subMenu: true } } 
          }
        }
      }
    });
    
    if (!rolePerms) {
      // Return graceful empty state rather than 404 to avoid Axios console errors 
      return res.status(200).json({ roleId: parseInt(id), menus: [] });
    }
    
    res.status(200).json(rolePerms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching role permissions", error: error.message });
  }
};
