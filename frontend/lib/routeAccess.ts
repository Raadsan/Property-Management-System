import { PERMISSIONS_CACHE_KEY, readNavCache, type StoredNavItem } from "@/lib/authSession";

export type PermissionFlags = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
};

export function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, "").toLowerCase();
  return trimmed || "/";
}

export function getPermissionsMap(): Record<string, PermissionFlags> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PERMISSIONS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getFlagsForPath(
  path: string,
  permissions: Record<string, PermissionFlags>,
  isAdmin = false
): PermissionFlags | null {
  if (isAdmin) {
    return { view: true, add: true, edit: true, delete: true, approve: true };
  }

  return permissions[normalizePath(path)] ?? null;
}

export function collectAllowedPaths(nav: StoredNavItem[]): Set<string> {
  const paths = new Set<string>();
  for (const item of nav) {
    if (item.url && item.url !== "#") {
      paths.add(normalizePath(item.url));
    }
    for (const sub of item.items ?? []) {
      if (sub.url) paths.add(normalizePath(sub.url));
    }
  }
  return paths;
}

export function canAccessAdminPath(
  pathname: string,
  nav: StoredNavItem[] = readNavCache(),
  permissions: Record<string, PermissionFlags> = getPermissionsMap(),
  isAdmin = false
): boolean {
  if (isAdmin) return true;

  const path = normalizePath(pathname);
  const flags = getFlagsForPath(path, permissions, false);
  if (flags?.view) return true;

  return collectAllowedPaths(nav).has(path);
}

export function getDefaultAdminRedirect(nav: StoredNavItem[] = readNavCache()): string {
  const paths = collectAllowedPaths(nav);
  if (paths.has("/dashboard")) return "/dashboard";
  return Array.from(paths)[0] ?? "/login";
}
