"use client";

import { useEffect, useState } from "react";
import { getMyAccess } from "@/api/userApi";
import { menusToNavItems, writeNavCache, writePermissionsCache } from "@/lib/authSession";
import { getFlagsForPath, getPermissionsMap, normalizePath } from "@/lib/routeAccess";

export type PagePermissions = {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isLoaded: boolean;
};

const EMPTY: PagePermissions = {
  canAdd: false,
  canEdit: false,
  canDelete: false,
  isLoaded: false,
};

export function usePagePermissions(menuPath: string): PagePermissions {
  const [permissions, setPermissions] = useState<PagePermissions>(EMPTY);

  useEffect(() => {
    let active = true;

    const applyFlags = (flags: { view: boolean; add: boolean; edit: boolean; delete: boolean } | null) => {
      if (!active) return;
      if (!flags?.view) {
        setPermissions({ canAdd: false, canEdit: false, canDelete: false, isLoaded: true });
        return;
      }
      setPermissions({
        canAdd: flags.add,
        canEdit: flags.edit,
        canDelete: flags.delete,
        isLoaded: true,
      });
    };

    const load = async () => {
      const path = normalizePath(menuPath);
      let map = getPermissionsMap();
      let flags = getFlagsForPath(path, map);

      if (flags) {
        applyFlags(flags);
        return;
      }

      try {
        const access = await getMyAccess();
        writePermissionsCache(access.permissions);
        writeNavCache(menusToNavItems(access.menus));
        map = access.permissions;
        flags = getFlagsForPath(path, map, access.isAdmin);
        applyFlags(flags);
      } catch {
        if (active) setPermissions({ ...EMPTY, isLoaded: true });
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [menuPath]);

  return permissions;
}
