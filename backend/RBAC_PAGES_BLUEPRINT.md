# Property Management RBAC Blueprint

This file defines how your property app pages should be separated into `Menu` and `SubMenu` and how to use:

- `Role`
- `Menu`
- `SubMenu`
- `RolePermissions`
- `RoleMenuAccess`
- `RoleSubMenuAccess`

## 1) Page Grouping (Mentor Structure)

### Dashboard
- `/dashboard`
- `/dashboard/reports`

### Properties
- `/properties`
- `/properties/new`
- `/property-types`
- `/property-inquiries`
- `/sales`
- `/leases`

### Videos
- `/videos`
- `/videos/new`

### Customers
- `/users`
- `/favorites`
- `/payments`

### Team
- `/agents`
- `/roles`
- `/role-permissions`
- `/menus`

### Content
- `/blogs`
- `/blog-categories`
- `/contact`

### Analytics
- `/reports`

This grouping is now codified in `scripts/seedRoleMenus.js`.

## 2) How Data Flows

1. `Role` = who the user is (ADMIN, AGENT, MANAGER, etc).
2. `RolePermissions` = one root permission row per role.
3. `RoleMenuAccess` = role access flags per menu (`canView/canAdd/canEdit/canDelete`).
4. `RoleSubMenuAccess` = role access flags per submenu under each menu.
5. Frontend sidebar should use `/api/menus/permissions/:roleId` to render only allowed menus/submenus.

## 3) Run Seed for Property Pages

From backend:

```bash
npm run seed:menus
```

This script will:
- upsert all menus/submenus from the blueprint
- create/update full admin access for role `ADMIN` (if role exists)

## 4) Recommended Role Strategy

Start with these role names:
- `ADMIN` (full access)
- `MANAGER` (most modules except destructive actions)
- `AGENT` (properties/videos/inquiries limited)
- `ACCOUNTANT` (payments/reports only)
- `CONTENT_EDITOR` (blogs/categories/contact only)

Then use `/api/role-permissions` to sync exact menu/submenu permissions.

## 5) Next Production Step

Current backend supports menu-based filtering.  
For strict backend security, add an authorization middleware that checks:
- user role
- requested route/menu/submenu
- required action (view/add/edit/delete)

Then apply middleware on protected routes.
