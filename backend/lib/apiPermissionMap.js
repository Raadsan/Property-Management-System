/**
 * Maps each protected API route to the same menu URL used in the database (SubMenu.url).
 * Backend authorize() uses these paths — they must match what you set in Settings → Menu.
 */
export const API_PERMISSION_MAP = {
  // Dashboard
  "GET /api/dashboard/stats": { menuPath: "/dashboard", action: "view" },

  // Users
  "GET /api/users": { menuPath: "/settings/users", action: "view" },
  "GET /api/users/by-role/:role": { menuPath: "/content/properties", action: "view" },
  "GET /api/users/:id": { menuPath: "/settings/users", action: "view" },
  "PATCH /api/users/:id": { menuPath: "/settings/users", action: "edit" },
  "DELETE /api/users/:id": { menuPath: "/settings/users", action: "delete" },

  // Roles
  "POST /api/roles": { menuPath: "/settings/roles", action: "add" },
  "GET /api/roles": { menuPath: "/settings/roles", action: "view" },
  "GET /api/roles/:id": { menuPath: "/settings/roles", action: "view" },
  "PATCH /api/roles/:id": { menuPath: "/settings/roles", action: "edit" },
  "DELETE /api/roles/:id": { menuPath: "/settings/roles", action: "delete" },

  // Menus & permissions
  "POST /api/menus": { menuPath: "/settings/menu", action: "add" },
  "GET /api/menus": { menuPath: "/settings/menu", action: "view" },
  "GET /api/menus/:id": { menuPath: "/settings/menu", action: "view" },
  "PATCH /api/menus/:id": { menuPath: "/settings/menu", action: "edit" },
  "DELETE /api/menus/:id": { menuPath: "/settings/menu", action: "delete" },
  "GET /api/menus/permissions/:roleId": { menuPath: "/settings/menu", action: "view" },

  "POST /api/role-permissions": { menuPath: "/settings/role-permissions", action: "edit" },
  "GET /api/role-permissions": { menuPath: "/settings/role-permissions", action: "view" },
  "GET /api/role-permissions/:id": { menuPath: "/settings/role-permissions", action: "view" },

  // Content
  "POST /api/property-types": { menuPath: "/content/categories", action: "add" },
  "PATCH /api/property-types/:id": { menuPath: "/content/categories", action: "edit" },
  "DELETE /api/property-types/:id": { menuPath: "/content/categories", action: "delete" },

  "POST /api/properties": { menuPath: "/content/properties", action: "add" },
  "PATCH /api/properties/:id": { menuPath: "/content/properties", action: "edit" },
  "PATCH /api/properties/:id/approve": { menuPath: "/content/properties", action: "edit" },
  "DELETE /api/properties/:id": { menuPath: "/content/properties", action: "delete" },

  "POST /api/blogs": { menuPath: "/content/blogs", action: "add" },
  "PATCH /api/blogs/:id": { menuPath: "/content/blogs", action: "edit" },
  "DELETE /api/blogs/:id": { menuPath: "/content/blogs", action: "delete" },

  "POST /api/blog-categories": { menuPath: "/content/blog-categories", action: "add" },
  "PATCH /api/blog-categories/:id": { menuPath: "/content/blog-categories", action: "edit" },
  "DELETE /api/blog-categories/:id": { menuPath: "/content/blog-categories", action: "delete" },

  "POST /api/sales": { menuPath: "/content/sales", action: "add" },
  "GET /api/sales": { menuPath: "/content/sales", action: "view" },
  "GET /api/sales/:id": { menuPath: "/content/sales", action: "view" },
  "PATCH /api/sales/:id": { menuPath: "/content/sales", action: "edit" },
  "DELETE /api/sales/:id": { menuPath: "/content/sales", action: "delete" },

  // Communication
  "POST /api/contact/admin": { menuPath: "/communication/messages", action: "add" },
  "GET /api/contact": { menuPath: "/communication/messages", action: "view" },
  "PUT /api/contact/:id/status": { menuPath: "/communication/messages", action: "edit" },
  "PUT /api/contact/:id/priority": { menuPath: "/communication/messages", action: "edit" },
  "DELETE /api/contact/:id": { menuPath: "/communication/messages", action: "delete" },

  "GET /api/property-inquiries": { menuPath: "/communication/property-inquiry", action: "view" },
  "DELETE /api/property-inquiries/:id": { menuPath: "/communication/property-inquiry", action: "delete" },

  // Reports & payments
  "GET /api/reports/transactions": { menuPath: "/reports", action: "view" },
  "GET /api/reports/properties": { menuPath: "/reports", action: "view" },
  "GET /api/reports/categories": { menuPath: "/reports", action: "view" },
  "GET /api/reports/users": { menuPath: "/reports", action: "view" },

  "POST /api/payments": { menuPath: "/settings/payments", action: "add" },
  "GET /api/payments": { menuPath: "/settings/payments", action: "view" },
  "GET /api/payments/:id": { menuPath: "/settings/payments", action: "view" },
  "PATCH /api/payments/:id": { menuPath: "/settings/payments", action: "edit" },
  "DELETE /api/payments/:id": { menuPath: "/settings/payments", action: "delete" },
};
