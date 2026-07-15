import {
  checkPermissionFromMap,
  getPermissionsMapForRole,
} from "../lib/permissions.js";
import { prisma } from "../lib/prisma.js";

/** Load permissions once per request (after protect) */
export async function loadPermissions(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!req.access) {
      const permissions = await getPermissionsMapForRole(
        req.user.roleId,
        req.user.role?.name
      );
      req.access = {
        isAdmin: req.user.role?.name?.toUpperCase() === "ADMIN",
        permissions,
      };
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Failed to load permissions", error: error.message });
  }
}

async function ensureAccess(req) {
  if (!req.access) {
    const permissions = await getPermissionsMapForRole(
      req.user.roleId,
      req.user.role?.name
    );
    req.access = {
      isAdmin: req.user.role?.name?.toUpperCase() === "ADMIN",
      permissions,
    };
  }
}

/**
 * Check RBAC using the same menu URLs stored in the database.
 * Example: authorize('/content/properties', 'edit') → checks SubMenu.url + canEdit
 */
export function authorize(menuPath, action = "view") {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      await ensureAccess(req);

      const allowed = checkPermissionFromMap(
        req.access.permissions,
        menuPath,
        action,
        req.access.isAdmin
      );

      if (!allowed) {
        return res.status(403).json({
          message: "Access denied — you do not have permission for this action",
          required: { menuPath, action },
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed", error: error.message });
    }
  };
}

/** Require the permission row stored for the role, without ADMIN's implicit bypass. */
export function authorizeExplicit(menuPath, action = "view") {
  const field = { view: "canView", add: "canAdd", edit: "canEdit", delete: "canDelete", approve: "canApprove" }[action];
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Not authorized" });
      if (!field) return res.status(500).json({ message: "Unknown authorization action" });

      const path = menuPath.replace(/\/+$/, "").toLowerCase();
      const subMenuAccess = await prisma.roleSubMenuAccess.findFirst({
        where: {
          roleMenuAccess: { rolePermissions: { roleId: req.user.roleId } },
          subMenu: { url: path },
          [field]: true,
        },
        select: { id: true },
      });
      const menuAccess = subMenuAccess ? null : await prisma.roleMenuAccess.findFirst({
        where: {
          rolePermissions: { roleId: req.user.roleId },
          menu: { url: path },
          [field]: true,
        },
        select: { id: true },
      });

      if (!subMenuAccess && !menuAccess) {
        return res.status(403).json({
          message: "Access denied — you do not have permission for this action",
          required: { menuPath, action },
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed", error: error.message });
    }
  };
}
