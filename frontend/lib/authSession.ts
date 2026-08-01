import type { Menu } from "@/api/menuApi";
import type { LoginResponse } from "@/api/userApi";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";
export const NAV_CACHE_KEY = "damal_admin_nav";
export const PERMISSIONS_CACHE_KEY = "damal_permissions";

export type StoredNavItem = {
  title: string;
  url: string;
  icon?: string;
  items?: { title: string; url: string }[];
};

function getStore(): Storage | null {
  if (typeof window === "undefined") return null;
  // Authentication is deliberately tab-session only. sessionStorage is cleared
  // when the browser session ends, so reopening Chrome requires signing in again.
  return window.sessionStorage;
}

/** Remove credentials saved by the old persistent-storage implementation. */
function clearLegacyLocalAuth() {
  if (typeof window === "undefined") return;
  for (const key of [TOKEN_KEY, USER_KEY, NAV_CACHE_KEY, PERMISSIONS_CACHE_KEY]) {
    localStorage.removeItem(key);
  }
}

export function getToken(): string | null {
  clearLegacyLocalAuth();
  return getStore()?.getItem(TOKEN_KEY) ?? null;
}

export function getUser<T = Record<string, unknown>>(): T | null {
  clearLegacyLocalAuth();
  try {
    const raw = getStore()?.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getToken() && getUser());
}

export function readNavCache(): StoredNavItem[] {
  clearLegacyLocalAuth();
  try {
    const raw = getStore()?.getItem(NAV_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeNavCache(nav: StoredNavItem[]) {
  getStore()?.setItem(NAV_CACHE_KEY, JSON.stringify(nav));
}

export function writePermissionsCache(permissions: Record<string, unknown>) {
  getStore()?.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(permissions));
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
  clearLegacyLocalAuth();
  const store = getStore();
  if (!store) return;

  store.setItem(USER_KEY, JSON.stringify(response.user));
  store.setItem(TOKEN_KEY, response.token);

  if (response.permissions) {
    store.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(response.permissions));
  }

  if (response.menus?.length) {
    store.setItem(NAV_CACHE_KEY, JSON.stringify(menusToNavItems(response.menus)));
  }
}

export function clearAuthSession() {
  const store = getStore();
  if (!store) return;

  store.removeItem(USER_KEY);
  store.removeItem(TOKEN_KEY);
  store.removeItem(NAV_CACHE_KEY);
  store.removeItem(PERMISSIONS_CACHE_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(NAV_CACHE_KEY);
  sessionStorage.removeItem(PERMISSIONS_CACHE_KEY);
}
