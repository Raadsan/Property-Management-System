import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"


export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[74px] shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        <ModeToggle />
      </div>
    </header>
  )
}
