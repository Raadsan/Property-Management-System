"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTheme } from "next-themes"
import * as Icons from "lucide-react"
import { getPermissionMenusByRole } from "@/api/menuApi"

const DynamicIcon = ({ name }: { name?: string }) => {
  if (!name) return null;
  const LucideIcon = (Icons as any)[name];
  return LucideIcon ? <LucideIcon /> : null;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navMain, setNavMain] = React.useState<any[]>([])
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    router.push("/login");
  };

  React.useEffect(() => {
    const fetchNav = async () => {
      try {
        const userStr = sessionStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(userStr);
        if (!user || !user.roleId) {
          console.warn("User roleId not found, redirecting to login");
          sessionStorage.removeItem("user");
          router.push("/login");
          return;
        }

        const menus = await getPermissionMenusByRole(user.roleId);
        
        const mapped = menus.map(m => ({
          title: m.title,
          url: m.url || "#",
          icon: m.icon ? <DynamicIcon name={m.icon} /> : undefined,
          items: m.isCollapsible && m.subMenus && m.subMenus.length > 0
            ? m.subMenus.map(sm => ({ title: sm.title, url: sm.url }))
            : undefined
        }));
        setNavMain(mapped);
      } catch (error) {
        console.error("Failed to fetch dynamic menus:", error)
      }
    }
    fetchNav()
  }, [router])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center py-1 px-4">
          <a href="#" className="flex flex-col items-center">
            <div className="relative w-[120px] h-[72px]">
              {mounted && (
                <Image 
                  src={resolvedTheme === "dark" ? "/Damal-02.png" : "/logo.png"} 
                  alt="Damal Logo" 
                  fill 
                  className="object-contain" 
                  priority
                />
              )}
            </div>
          </a>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navMain.length > 0 ? (
          <NavMain items={navMain} />
        ) : (
          <div className="p-4 text-xs text-muted-foreground flex items-center gap-2">
            <Icons.Loader2Icon className="h-3 w-3 animate-spin" /> Loading Navigation...
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icons.LogOutIcon className="size-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
