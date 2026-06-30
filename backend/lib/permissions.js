import { prisma } from "./prisma.js";

const ACTION_FIELDS = {
  view: "canView",
  add: "canAdd",
  edit: "canEdit",
  delete: "canDelete",
};

export function normalizePath(path) {
  if (!path) return "";
  return path.replace(/\/+$/, "").toLowerCase();
}

function flagsFromRecord(record) {
  if (!record) return { view: false, add: false, edit: false, delete: false };
  return {
    view: Boolean(record.canView),
    add: Boolean(record.canAdd),
    edit: Boolean(record.canEdit),
    delete: Boolean(record.canDelete),
  };
}

function fullAccess() {
  return { view: true, add: true, edit: true, delete: true };
}

/** Sidebar menus — same data the frontend uses */
export async function getAllowedMenusForRole(roleId, roleName) {
  const isAdmin = roleName?.toUpperCase() === "ADMIN";

  if (isAdmin) {
    return prisma.menu.findMany({
      orderBy: { order: "asc" },
      include: { subMenus: { orderBy: { order: "asc" } } },
    });
  }

  const rolePerms = await prisma.rolePermissions.findUnique({
    where: { roleId },
  });

  if (!rolePerms) return [];

  const menus = await prisma.menu.findMany({
    orderBy: { order: "asc" },
    include: {
      roleMenus: {
        where: { rolePermissionsId: rolePerms.id },
      },
      subMenus: {
        orderBy: { order: "asc" },
        include: {
          roleSubMenus: {
            where: { roleMenuAccess: { rolePermissionsId: rolePerms.id } },
          },
        },
      },
    },
  });

  return menus
    .filter((m) => m.roleMenus?.length > 0 && m.roleMenus[0].canView)
    .map((m) => ({
      ...m,
      subMenus: m.subMenus.filter(
        (sm) => sm.roleSubMenus?.length > 0 && sm.roleSubMenus[0].canView
      ),
    }));
}

/** Flat permission map keyed by menu/submenu URL — used by API authorize checks */
export async function getPermissionsMapForRole(roleId, roleName) {
  const isAdmin = roleName?.toUpperCase() === "ADMIN";
  const permissions = {};

  const menus = await prisma.menu.findMany({
    orderBy: { order: "asc" },
    include: {
      roleMenus: isAdmin
        ? false
        : {
            where: { rolePermissions: { roleId } },
          },
      subMenus: {
        orderBy: { order: "asc" },
        include: {
          roleSubMenus: isAdmin
            ? false
            : {
                where: { roleMenuAccess: { rolePermissions: { roleId } } },
              },
        },
      },
    },
  });

  for (const menu of menus) {
    if (menu.url) {
      if (isAdmin) {
        permissions[normalizePath(menu.url)] = fullAccess();
      } else if (menu.roleMenus?.[0]) {
        permissions[normalizePath(menu.url)] = flagsFromRecord(menu.roleMenus[0]);
      }
    }

    for (const subMenu of menu.subMenus) {
      if (isAdmin) {
        permissions[normalizePath(subMenu.url)] = fullAccess();
      } else if (subMenu.roleSubMenus?.[0]) {
        permissions[normalizePath(subMenu.url)] = flagsFromRecord(subMenu.roleSubMenus[0]);
      }
    }
  }

  return permissions;
}

export async function getRoleAccess(roleId, roleName) {
  const [menus, permissions] = await Promise.all([
    getAllowedMenusForRole(roleId, roleName),
    getPermissionsMapForRole(roleId, roleName),
  ]);

  return {
    roleId,
    roleName: roleName ?? null,
    isAdmin: roleName?.toUpperCase() === "ADMIN",
    menus,
    permissions,
  };
}

export async function checkPermission(roleId, roleName, menuPath, action) {
  if (roleName?.toUpperCase() === "ADMIN") return true;

  const permissions = await getPermissionsMapForRole(roleId, roleName);
  const target = normalizePath(menuPath);

  if (permissions[target]?.[action]) return true;

  // Allow partial path match when DB url differs slightly
  for (const [url, flags] of Object.entries(permissions)) {
    if (!flags[action]) continue;
    if (target.startsWith(url) || url.startsWith(target)) return true;
  }

  return false;
}

export function checkPermissionFromMap(permissions, menuPath, action, isAdmin = false) {
  if (isAdmin) return true;

  const target = normalizePath(menuPath);
  if (permissions[target]?.[action]) return true;

  for (const [url, flags] of Object.entries(permissions)) {
    if (!flags[action]) continue;
    if (target.startsWith(url) || url.startsWith(target)) return true;
  }

  return false;
}

export { ACTION_FIELDS };
