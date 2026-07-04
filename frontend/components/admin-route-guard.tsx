"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { getMyAccess } from "@/api/userApi";
import {
  menusToNavItems,
  readNavCache,
  writeNavCache,
  writePermissionsCache,
  getToken,
  getUser,
} from "@/lib/authSession";
import {
  canAccessAdminPath,
  getDefaultAdminRedirect,
  getPermissionsMap,
} from "@/lib/routeAccess";

type GuardState = "loading" | "allowed" | "denied";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<GuardState>("loading");

  useEffect(() => {
    let active = true;

    const verifyAccess = async () => {
      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        router.replace("/login");
        return;
      }

      let cachedNav = readNavCache();
      let permissions = getPermissionsMap();
      let isAdmin = false;

      try {
        isAdmin = (user as { role?: { name?: string } })?.role?.name?.toUpperCase() === "ADMIN";
      } catch {
        router.replace("/login");
        return;
      }

      if (cachedNav.length === 0 || Object.keys(permissions).length === 0) {
        try {
          const access = await getMyAccess();
          cachedNav = menusToNavItems(access.menus);
          permissions = access.permissions;
          isAdmin = access.isAdmin;
          writeNavCache(cachedNav);
          writePermissionsCache(access.permissions);
        } catch {
          if (!active) return;
          router.replace("/login");
          return;
        }
      }

      if (!active) return;

      if (canAccessAdminPath(pathname, cachedNav, permissions, isAdmin)) {
        setState("allowed");
        return;
      }

      setState("denied");
      toast.error("You do not have permission to access this page.");
      router.replace(getDefaultAdminRedirect(cachedNav));
    };

    setState("loading");
    verifyAccess();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (state === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh] text-muted-foreground gap-2">
        <Loader2Icon className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Checking access...</span>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[50vh] text-muted-foreground gap-3">
        <ShieldAlertIcon className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">Redirecting — access denied.</p>
      </div>
    );
  }

  return <>{children}</>;
}
