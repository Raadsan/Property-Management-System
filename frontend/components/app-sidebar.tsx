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
import {
  LayoutDashboardIcon,
  Building2Icon,
  UsersIcon,
  FileSignatureIcon,
  WrenchIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  WalletIcon,
  FileBarChartIcon,
  ShieldCheckIcon,
  HomeIcon,
  PlusCircleIcon,
  CommandIcon,
  LogOutIcon
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Registrations",
      url: "#",
      icon: <Building2Icon />,
      items: [
        {
          title: "Categories",
          url: "/dashboard/categories",
        },
        {
          title: "Properties",
          url: "/dashboard/properties",
        },
      ],
    },
    {
      title: "Configurations",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Roles",
          url: "/dashboard/roles",
        },
        {
          title: "Users",
          url: "/dashboard/users",
        },
        {
          title: "Menu",
          url: "/dashboard/menu",
        },
        {
          title: "Role-Permission",
          url: "/dashboard/role-permissions",
        },
      ],
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: <FileBarChartIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">PropManage PMS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <LogOutIcon className="size-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
