"use client"

import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({})

  const isPathActive = (url: string) =>
    pathname === url || (url !== "/" && url !== "#" && pathname.startsWith(url))

  // Auto-open parent when a child route is active; auto-close when leaving the section
  React.useEffect(() => {
    const next: Record<string, boolean> = {}
    for (const item of items) {
      if (!item.items) continue
      const subActive = item.items.some((subItem) => isPathActive(subItem.url))
      next[item.title] = subActive
    }
    setExpandedMenus(next)
  }, [pathname, items])

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isSubActive = item.items?.some((subItem) => isPathActive(subItem.url))
            const isActive = !item.items && isPathActive(item.url)
            const isOpen = expandedMenus[item.title] ?? false

            return (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  <Collapsible
                    className="group/menu-item"
                    open={isOpen}
                    onOpenChange={(open) => {
                      setExpandedMenus((prev) => ({ ...prev, [item.title]: open }))
                    }}
                  >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isSubActive}>
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto size-[15px] shrink-0 opacity-60 transition-transform duration-200 group-data-[state=open]/menu-item:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isPathActive(subItem.url)}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )})}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
