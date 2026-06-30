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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import * as Icons from "lucide-react"
import { getPermissionMenusByRole } from "@/api/menuApi"
import {
  NAV_CACHE_KEY,
  clearAuthSession,
  menusToNavItems,
  readNavCache,
  type StoredNavItem,
} from "@/lib/authSession"

const DynamicIcon = ({ name }: { name?: string }) => {
  if (!name) return null;
  const LucideIcon = (Icons as any)[name];
  return LucideIcon ? <LucideIcon strokeWidth={1.5} /> : null;
}

function toNavItems(stored: StoredNavItem[]) {
  return stored.map((item) => ({
    ...item,
    icon: item.icon ? <DynamicIcon name={item.icon} /> : undefined,
  }))
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navMain, setNavMain] = React.useState<any[]>([])
  const [isNavLoading, setIsNavLoading] = React.useState(true)
  const router = useRouter()
  const { state } = useSidebar()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    const cached = readNavCache()
    if (cached.length > 0) {
      setNavMain(toNavItems(cached))
      setIsNavLoading(false)
    }

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

        const stored = menusToNavItems(menus);

        sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify(stored));
        setNavMain(toNavItems(stored));
        setIsNavLoading(false);
      } catch (error) {
        console.error("Failed to fetch dynamic menus:", error)
        setIsNavLoading(false)
      }
    }
    fetchNav()
  }, [router])

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon" className="bg-sidebar text-sidebar-foreground shadow-lg dark:shadow-none border-r-0 dark:border-r dark:border-border transition-all duration-300" {...props}>
      <SidebarHeader className="overflow-hidden px-4 pt-5 pb-3">
        <div className={`flex items-center justify-center transition-all duration-300 ${state === "collapsed" ? "w-10 h-10" : "w-full"}`}>
          <Link href="/dashboard" className="flex flex-col items-center">
            <div className={`relative transition-all duration-300 ${state === "collapsed" ? "w-8 h-8" : "w-[108px] h-[64px]"}`}>
              {mounted && (
                <Image 
                  src="/Damal-02.png" 
                  alt="Damal Logo" 
                  fill 
                  className="object-contain" 
                  priority
                />
              )}
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1 pt-1">
        {isNavLoading ? (
          <div className="p-4 text-[13px] text-sidebar-foreground/60 flex items-center gap-2">
            <Icons.Loader2Icon className="h-3.5 w-3.5 animate-spin" /> Loading Navigation...
          </div>
        ) : navMain.length > 0 ? (
          <NavMain items={navMain} />
        ) : (
          <div className="p-4 text-[13px] text-sidebar-foreground/60">
            No navigation items available.
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-3 py-3 overflow-hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Icons.LogOutIcon className="size-5" strokeWidth={1.75} />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
