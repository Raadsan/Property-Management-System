import { prisma } from "../lib/prisma.js";
import { getAllowedMenusForRole } from "../lib/permissions.js"; // Trigger nodemon reload

export const createMenu = async (req, res) => {
    const { title, icon, url, isCollapsible, order, subMenus } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    try {
        const data = { 
            title, 
            icon, 
            url, 
            isCollapsible, 
            order: order !== undefined ? parseInt(order) : 0 
        };

        // Automatically nest submenu creation if provided
        if (subMenus && Array.isArray(subMenus)) {
            data.subMenus = {
                create: subMenus.map(sm => ({ 
                    title: sm.title, 
                    url: sm.url,
                    order: sm.order !== undefined ? parseInt(sm.order) : 0
                }))
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
            orderBy: { order: "asc" },
            include: { 
                subMenus: {
                    orderBy: { order: "asc" }
                } 
            }
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
            include: { 
                subMenus: {
                    orderBy: { order: "asc" }
                } 
            }
        });
        if (!menu) return res.status(404).json({ message: "Menu not found" });
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menu", error: error.message });
    }
};

export const updateMenu = async (req, res) => {
    const { id } = req.params;
    const { title, icon, url, isCollapsible, order, subMenus } = req.body;

    try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (icon !== undefined) updateData.icon = icon;
        if (url !== undefined) updateData.url = url;
        if (isCollapsible !== undefined) updateData.isCollapsible = isCollapsible;
        if (order !== undefined) updateData.order = parseInt(order);

        if (subMenus && Array.isArray(subMenus)) {
            const existingMenu = await prisma.menu.findUnique({
                where: { id: parseInt(id) },
                include: { subMenus: true }
            });

            const existingSubMenuIds = existingMenu?.subMenus.map(sm => sm.id) || [];
            const incomingSubMenuIds = subMenus.filter(sm => sm.id).map(sm => parseInt(sm.id));

            const idsToDelete = existingSubMenuIds.filter(smId => !incomingSubMenuIds.includes(smId));

            updateData.subMenus = {
                deleteMany: { id: { in: idsToDelete } },
                update: subMenus.filter(sm => sm.id).map(sm => ({
                    where: { id: parseInt(sm.id) },
                    data: { 
                        title: sm.title, 
                        url: sm.url,
                        order: sm.order !== undefined ? parseInt(sm.order) : 0
                    }
                })),
                create: subMenus.filter(sm => !sm.id).map(sm => ({ 
                    title: sm.title, 
                    url: sm.url,
                    order: sm.order !== undefined ? parseInt(sm.order) : 0
                }))
            };
        }

        const updatedMenu = await prisma.menu.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { subMenus: true }
        });

        // Create explicit default-deny records for new submenus. Access must be
        // granted later from the Role Permissions matrix.
        if (subMenus && Array.isArray(subMenus)) {
            const roleMenuAccesses = await prisma.roleMenuAccess.findMany({
                where: { menuId: parseInt(id) }
            });

            for (const rma of roleMenuAccesses) {
                for (const sm of updatedMenu.subMenus) {
                    await prisma.roleSubMenuAccess.upsert({
                        where: {
                            roleMenuAccessId_subMenuId: {
                                roleMenuAccessId: rma.id,
                                subMenuId: sm.id
                            }
                        },
                        update: {},
                        create: {
                            roleMenuAccessId: rma.id,
                            subMenuId: sm.id,
                            canView: false,
                            canAdd: false,
                            canEdit: false,
                            canDelete: false,
                            canApprove: false
                        }
                    });
                }
            }
        }

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

        const role = await prisma.role.findUnique({ where: { id } });
        const allowedMenus = await getAllowedMenusForRole(id, role?.name);

        res.status(200).json(allowedMenus);

    } catch (error) {
        res.status(500).json({ message: "Error fetching permission menus", error: error.message });
    }
};
