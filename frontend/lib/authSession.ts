import type { Menu } from "@/api/menuApi";
import type { LoginResponse } from "@/api/userApi";

export const NAV_CACHE_KEY = "damal_admin_nav";
export const PERMISSIONS_CACHE_KEY = "damal_permissions";

export type StoredNavItem = {
  title: string;
  url: string;
  icon?: string;
  items?: { title: string; url: string }[];
};

export function readNavCache(): StoredNavItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(NAV_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function menusToNavItems(menus: Menu[]): StoredNavItem[] {
  return menus.map((m) => ({
    title: m.title,
    url: m.url || "#",
    icon: m.icon,
    items:
      m.isCollapsible && m.subMenus && m.subMenus.length > 0
        ? m.subMenus.map((sm) => ({ title: sm.title, url: sm.url }))
        : undefined,
  }));
}

export function saveAuthSession(response: LoginResponse) {
  sessionStorage.setItem("user", JSON.stringify(response.user));
  sessionStorage.setItem("token", response.token);

  if (response.permissions) {
    sessionStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(response.permissions));
  }

  if (response.menus?.length) {
    sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify(menusToNavItems(response.menus)));
  }
}

export function clearAuthSession() {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem(NAV_CACHE_KEY);
  sessionStorage.removeItem(PERMISSIONS_CACHE_KEY);
}
