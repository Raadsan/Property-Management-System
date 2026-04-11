"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "next/navigation"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname() || "";
  
  // Define which route families are allowed to use Dark Mode
  const isDashboardRoute = pathname.startsWith("/dashboard") || 
                           pathname.startsWith("/configurations") || 
                           pathname.startsWith("/registrations");

  return (
    <NextThemesProvider 
      {...props} 
      forcedTheme={!isDashboardRoute ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  )
}