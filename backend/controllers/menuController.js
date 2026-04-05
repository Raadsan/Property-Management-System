import { prisma } from "../lib/prisma.js";

export const createMenu = async (req, res) => {
    const { title, icon, url, isCollapsible, subMenus } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    try {
        const data = { title, icon, url, isCollapsible };

        // Automatically nest submenu creation if provided
        if (subMenus && Array.isArray(subMenus)) {
            data.subMenus = {
                create: subMenus.map(sm => ({ title: sm.title, url: sm.url }))
            };
        }

        const menu = await prisma.menu.create({
            data,
            include: { subMenus: true }
        });
        res.status(201).json({ message: "Menu created successfully", menu });
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ message: "Menu title already exists" });
        res.status(500).json({ message: "Error creating menu", error: error.message });
    }
};

export const getMenus = async (req, res) => {
    try {
        const menus = await prisma.menu.findMany({
            include: { subMenus: true }
        });
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menus", error: error.message });
    }
};

export const getMenuById = async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await prisma.menu.findUnique({
            where: { id: parseInt(id) },
            include: { subMenus: true }
        });
        if (!menu) return res.status(404).json({ message: "Menu not found" });
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menu", error: error.message });
    }
};

export const updateMenu = async (req, res) => {
    const { id } = req.params;
    const { title, icon, url, isCollapsible, subMenus } = req.body;

    try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (icon !== undefined) updateData.icon = icon;
        if (url !== undefined) updateData.url = url;
        if (isCollapsible !== undefined) updateData.isCollapsible = isCollapsible;

        // Handle nested submenu updates (replace them entirely for simplicity)
        if (subMenus && Array.isArray(subMenus)) {
            updateData.subMenus = {
                deleteMany: {}, // Clean existing
                create: subMenus.map(sm => ({ title: sm.title, url: sm.url }))
            };
        }

        const updatedMenu = await prisma.menu.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { subMenus: true }
        });

        res.status(200).json({ message: "Menu updated successfully", menu: updatedMenu });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ message: "Menu not found" });
        res.status(500).json({ message: "Error updating menu", error: error.message });
    }
};

export const deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.menu.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Menu deleted successfully" });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ message: "Menu not found" });
        res.status(500).json({ message: "Error deleting menu", error: error.message });
    }
};

// @desc    Get menus based on role permissions
// @route   GET /api/menus/permissions/:roleId
export const getPermissionMenusByRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const id = parseInt(roleId);
        
        if (isNaN(id)) {
            console.error("Invalid Role ID received:", roleId);
            return res.status(400).json({ message: "Invalid Role ID" });
        }

        // 1. Find the RolePermissions object for this role first
        const rolePerms = await prisma.rolePermissions.findUnique({
            where: { roleId: id }
        });

        if (!rolePerms) {
            return res.status(200).json([]); // No permissions defined yet
        }

        // 2. Get all menus and include their specific role permissions
        const menus = await prisma.menu.findMany({
            include: {
                roleMenus: {
                    where: { rolePermissionsId: rolePerms.id }
                },
                subMenus: {
                    include: {
                        roleSubMenus: {
                            where: { roleMenuAccess: { rolePermissionsId: rolePerms.id } }
                        }
                    }
                }
            }
        });

        // 3. Filter out menus and submenus based on canView
        const allowedMenus = menus
            .filter(m => m.roleMenus && m.roleMenus.length > 0 && m.roleMenus[0].canView)
            .map(m => ({
                ...m,
                subMenus: m.subMenus.filter(sm => sm.roleSubMenus && sm.roleSubMenus.length > 0 && sm.roleSubMenus[0].canView)
            }));

        res.status(200).json(allowedMenus);

    } catch (error) {
        res.status(500).json({ message: "Error fetching permission menus", error: error.message });
    }
};
