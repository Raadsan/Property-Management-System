"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const ADMIN_ROUTE_PREFIXES = [
  "/dashboard",
  "/content",
  "/settings",
  "/reports",
  "/communication",
]

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (!isAdminRoute(pathname)) {
    return children
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="mt-0! mr-0!">
        <SiteHeader />
        <AdminRouteGuard>{children}</AdminRouteGuard>
      </SidebarInset>
    </SidebarProvider>
  )
}
