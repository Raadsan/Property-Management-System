import { prisma } from "../lib/prisma.js";

const modules = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    isCollapsible: false,
    order: 1,
    subMenus: [
      { title: "Overview", url: "/dashboard", order: 1 },
      { title: "Reports Summary", url: "/dashboard/reports", order: 2 },
    ],
  },
  {
    title: "Properties",
    icon: "Building2",
    isCollapsible: true,
    order: 2,
    subMenus: [
      { title: "All Properties", url: "/properties", order: 1 },
      { title: "Add Property", url: "/properties/new", order: 2 },
      { title: "Property Types", url: "/property-types", order: 3 },
      { title: "Property Inquiries", url: "/property-inquiries", order: 4 },
      { title: "Sales", url: "/sales", order: 5 },
      { title: "Leases", url: "/leases", order: 6 },
    ],
  },
  {
    title: "Videos",
    icon: "Video",
    isCollapsible: true,
    order: 3,
    subMenus: [
      { title: "All Videos", url: "/videos", order: 1 },
      { title: "Upload Video", url: "/videos/new", order: 2 },
    ],
  },
  {
    title: "Customers",
    icon: "Users",
    isCollapsible: true,
    order: 4,
    subMenus: [
      { title: "Users", url: "/users", order: 1 },
      { title: "Favorites", url: "/favorites", order: 2 },
      { title: "Payments", url: "/payments", order: 3 },
    ],
  },
  {
    title: "Team",
    icon: "UserCog",
    isCollapsible: true,
    order: 5,
    subMenus: [
      { title: "Agents", url: "/agents", order: 1 },
      { title: "Roles", url: "/roles", order: 2 },
      { title: "Role Permissions", url: "/role-permissions", order: 3 },
      { title: "Menus", url: "/menus", order: 4 },
    ],
  },
  {
    title: "Content",
    icon: "Newspaper",
    isCollapsible: true,
    order: 6,
    subMenus: [
      { title: "Blogs", url: "/blogs", order: 1 },
      { title: "Blog Categories", url: "/blog-categories", order: 2 },
      { title: "Contact Messages", url: "/contact", order: 3 },
    ],
  },
  {
    title: "Analytics",
    icon: "BarChart3",
    isCollapsible: true,
    order: 7,
    subMenus: [
      { title: "Reports", url: "/reports", order: 1 },
    ],
  },
];

async function ensureAdminRolePermissions() {
  const adminRole = await prisma.role.findFirst({
    where: { name: { equals: "ADMIN" } },
  });

  if (!adminRole) {
    console.log('No ADMIN role found. Skipping permission auto-assignment.');
    return;
  }

  const rolePermissions = await prisma.rolePermissions.upsert({
    where: { roleId: adminRole.id },
    update: {},
    create: { roleId: adminRole.id },
  });

  const menus = await prisma.menu.findMany({
    include: { subMenus: true },
    orderBy: { order: "asc" },
  });

  for (const menu of menus) {
    const roleMenuAccess = await prisma.roleMenuAccess.upsert({
      where: {
        rolePermissionsId_menuId: {
          rolePermissionsId: rolePermissions.id,
          menuId: menu.id,
        },
      },
      update: {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
      },
      create: {
        rolePermissionsId: rolePermissions.id,
        menuId: menu.id,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
      },
    });

    for (const subMenu of menu.subMenus) {
      await prisma.roleSubMenuAccess.upsert({
        where: {
          roleMenuAccessId_subMenuId: {
            roleMenuAccessId: roleMenuAccess.id,
            subMenuId: subMenu.id,
          },
        },
        update: {
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: true,
        },
        create: {
          roleMenuAccessId: roleMenuAccess.id,
          subMenuId: subMenu.id,
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: true,
        },
      });
    }
  }

  console.log("ADMIN role permissions fully synced.");
}

async function seedMenusAndSubMenus() {
  for (const module of modules) {
    const menu = await prisma.menu.upsert({
      where: { title: module.title },
      update: {
        icon: module.icon,
        isCollapsible: module.isCollapsible,
        order: module.order,
      },
      create: {
        title: module.title,
        icon: module.icon,
        isCollapsible: module.isCollapsible,
        order: module.order,
      },
    });

    for (const subMenu of module.subMenus) {
      const existingSubMenu = await prisma.subMenu.findFirst({
        where: { menuId: menu.id, url: subMenu.url },
      });

      if (existingSubMenu) {
        await prisma.subMenu.update({
          where: { id: existingSubMenu.id },
          data: {
            title: subMenu.title,
            order: subMenu.order,
          },
        });
      } else {
        await prisma.subMenu.create({
          data: {
            menuId: menu.id,
            title: subMenu.title,
            url: subMenu.url,
            order: subMenu.order,
          },
        });
      }
    }
  }
}

async function main() {
  console.log("Seeding property app menu and submenu structure...");
  await seedMenusAndSubMenus();
  await ensureAdminRolePermissions();
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
