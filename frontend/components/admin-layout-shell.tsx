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
      className="h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset className="mt-0! mr-0! h-svh min-h-0 min-w-0 overflow-hidden rounded-none shadow-none">
        <SiteHeader />
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <AdminRouteGuard>{children}</AdminRouteGuard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
