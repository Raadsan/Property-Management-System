import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking existing menus...');
  const menus = await prisma.menu.findMany({
    include: { subMenus: true }
  });
  console.log('Current Menus:', JSON.stringify(menus, null, 2));

  // Find or create "Registrations" menu
  let regMenu = menus.find(m => m.title === "Registrations");
  
  if (!regMenu) {
    console.log('Registrations menu not found. Creating it...');
    regMenu = await prisma.menu.create({
      data: {
        title: "Registrations",
        icon: "Settings", // Default icon
        isCollapsible: true
      },
      include: { subMenus: true }
    });
  }

  // Add Blog submenus
  const blogSubmenus = [
    { title: "Blogs", url: "/registrations/blogs" },
    { title: "Blog Category", url: "/registrations/blog-category" }
  ];

  for (const sub of blogSubmenus) {
    const exists = regMenu.subMenus.some(sm => sm.url === sub.url);
    if (!exists) {
      console.log(`Adding submenu: ${sub.title}`);
      await prisma.subMenu.create({
        data: {
          title: sub.title,
          url: sub.url,
          menuId: regMenu.id
        }
      });
    } else {
      console.log(`Submenu already exists: ${sub.title}`);
    }
  }

  // IMPORTANT: Grant permissions to Admin role (assuming roleId 1 is Admin)
  // Check rolePermissions
  const adminRoleId = 1;
  const rolePerms = await prisma.rolePermissions.findUnique({
      where: { roleId: adminRoleId }
  });

  if (rolePerms) {
      // Grant Access to Registrations Menu if not already granted
      const menuAccess = await prisma.roleMenuAccess.upsert({
          where: { 
              rolePermissionsId_menuId: {
                  rolePermissionsId: rolePerms.id,
                  menuId: regMenu.id
              }
          },
          update: { canView: true },
          create: {
              rolePermissionsId: rolePerms.id,
              menuId: regMenu.id,
              canView: true
          }
      });

      // Grant Access to SubMenus
      const updatedRegMenu = await prisma.menu.findUnique({
          where: { id: regMenu.id },
          include: { subMenus: true }
      });

      for (const sm of updatedRegMenu.subMenus) {
          await prisma.roleSubMenuAccess.upsert({
              where: {
                  roleMenuAccessId_subMenuId: {
                      roleMenuAccessId: menuAccess.id,
                      subMenuId: sm.id
                  }
              },
              update: { canView: true },
              create: {
                  roleMenuAccessId: menuAccess.id,
                  subMenuId: sm.id,
                  canView: true
              }
          });
      }
      console.log('Permissions updated for Admin.');
  }

  console.log('Menu setup completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
