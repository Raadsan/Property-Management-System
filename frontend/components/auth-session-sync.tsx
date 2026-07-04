"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TOKEN_KEY, clearAuthSession, getToken } from "@/lib/authSession";

const ADMIN_PREFIXES = ["/dashboard", "/content", "/settings", "/reports", "/communication"];

function isAdminPath(path: string) {
  return ADMIN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Keeps tabs in sync when login/logout happens in another tab. */
export function AuthSessionSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_KEY) return;

      if (!event.newValue) {
        clearAuthSession();
        if (isAdminPath(pathname)) {
          router.replace("/login");
        } else {
          window.location.reload();
        }
        return;
      }

      if (!getToken() && event.newValue) {
        window.location.reload();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname, router]);

  return null;
}
