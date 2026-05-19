"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, MenuIcon, NetworkIcon } from "lucide-react"

import { getMenus, createMenu, updateMenu, deleteMenu, Menu, SubMenu } from "@/api/menuApi"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function MenuConfigurationPage() {
  const [menus, setMenus] = React.useState<Menu[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentMenu, setCurrentMenu] = React.useState<Menu | null>(null)
  
  // Form State
  const [title, setTitle] = React.useState("")
  const [icon, setIcon] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [isCollapsible, setIsCollapsible] = React.useState(false)
  const [order, setOrder] = React.useState<number>(0)
  
  // Dynamic SubMenu State
  const [subMenus, setSubMenus] = React.useState<{ id?: number, title: string, url: string, order: number }[]>([])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getMenus()
      setMenus(data)
    } catch (error) {
      toast.error("Failed to load menus")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleAddSubMenu = () => {
    setSubMenus([...subMenus, { title: "", url: "", order: 0 }])
  }

  const handleSubMenuChange = (index: number, field: 'title' | 'url' | 'order', value: any) => {
    const updated = [...subMenus]
    if (field === 'order') {
      updated[index][field] = parseInt(value) || 0
    } else {
      updated[index][field] = value
    }
    setSubMenus(updated)
  }

  const handleRemoveSubMenu = (index: number) => {
    setSubMenus(subMenus.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return toast.error("Menu Title is strictly required.")

    // Filter out completely blank submenus
    const cleanSubMenus = subMenus.filter(sm => sm.title.trim() !== "" || sm.url.trim() !== "")
      .map(sm => ({ id: sm.id, title: sm.title, url: sm.url, order: sm.order }))

    try {
      const payload = {
        title,
        icon: icon || undefined,
        url: url || undefined,
        isCollapsible,
        order,
        subMenus: cleanSubMenus
      }

      if (currentMenu) {
        await updateMenu(currentMenu.id, payload)
        toast.success("Menu updated successfully")
      } else {
        await createMenu(payload)
        toast.success("Menu created successfully")
      }
      
      setIsModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while saving the menu")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu hierarchy? This action cannot be undone.")) return

    try {
      await deleteMenu(id)
      toast.success("Menu deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete menu")
    }
  }

  const openEditModal = (menu: Menu) => {
    setCurrentMenu(menu)
    setTitle(menu.title)
    setIcon(menu.icon || "")
    setUrl(menu.url || "")
    setIsCollapsible(menu.isCollapsible)
    setOrder(menu.order || 0)
    
    if (menu.subMenus && menu.subMenus.length > 0) {
      setSubMenus(menu.subMenus.map(sm => ({ id: sm.id, title: sm.title, url: sm.url, order: sm.order || 0 })))
    } else {
      setSubMenus([])
    }
    
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentMenu(null)
    setTitle("")
    setIcon("")
    setUrl("")
    setIsCollapsible(false)
    setOrder(0)
    setSubMenus([])
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="mt-0! mr-0!">
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Main Menu Builder</h1>
              <p className="text-muted-foreground">Construct dynamic navigation menus and nested submenus.</p>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="btn-category shrink-0">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Menu
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{currentMenu ? "Edit Global Menu" : "Construct New Menu"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                  
                  {/* Primary Config */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label htmlFor="title">Menu Title <span className="text-red-500">*</span></Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Settings" required />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label htmlFor="icon">Lucide Icon name</Label>
                      <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. Settings2Icon" />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label htmlFor="order">Menu Order</Label>
                      <Input id="order" type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} placeholder="e.g. 0" />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="url">Primary URL Route</Label>
                      <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. /dashboard/settings (optional if collapsible)" />
                    </div>

                    <div className="space-y-2 col-span-2 flex items-center justify-between border rounded-md p-4 bg-muted/20">
                      <div>
                        <Label htmlFor="collapsible" className="text-base">Is Collapsible?</Label>
                        <p className="text-xs text-muted-foreground">Allows the menu to expand mathematically revealing submenus.</p>
                      </div>
                      <Switch id="collapsible" checked={isCollapsible} onCheckedChange={setIsCollapsible} />
                    </div>
                  </div>

                  {/* SubMenus Array */}
                  <div className="border bg-muted/10 p-4 rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base flex items-center gap-2"><NetworkIcon className="w-4 h-4" /> Nested SubMenus</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddSubMenu}>
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Node
                      </Button>
                    </div>

                    {subMenus.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic text-center py-4">No submenus configured. Click Add Node setup dropdown links.</div>
                    ) : (
                       <div className="space-y-3">
                        {subMenus.map((sm, index) => (
                           <div key={index} className="flex gap-2 items-center bg-background p-2 rounded border">
                             <div className="flex-1 space-y-1">
                               <Input placeholder="SubMenu Title (e.g. Users)" value={sm.title} onChange={e => handleSubMenuChange(index, 'title', e.target.value)} className="h-8" />
                               <Input placeholder="Route (e.g. /dashboard/users)" value={sm.url} onChange={e => handleSubMenuChange(index, 'url', e.target.value)} className="h-8" />
                               <Input placeholder="Order (e.g. 1)" type="number" value={sm.order || 0} onChange={e => handleSubMenuChange(index, 'order', e.target.value)} className="h-8" />
                             </div>
                             <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8" onClick={() => handleRemoveSubMenu(index)}>
                               <TrashIcon className="h-4 w-4" />
                             </Button>
                           </div>
                        ))}
                       </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" className="btn-category w-full md:w-auto">
                      {currentMenu ? "Update Navigation" : "Build Navigation Node"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[60px]">id</TableHead>
                  <TableHead className="w-[80px]">order</TableHead>
                  <TableHead>title</TableHead>
                  <TableHead>icon</TableHead>
                  <TableHead>url</TableHead>
                  <TableHead>isCollapsible</TableHead>
                  <TableHead>subMenus</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span>Loading navigation layout...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : menus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MenuIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p>No navigation menus established. Construct your first menu.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  menus.map((menu) => (
                    <TableRow key={menu.id} className="hover:bg-muted/30 transition-colors">
                      
                      <TableCell className="font-mono text-muted-foreground">
                        {menu.id}
                      </TableCell>

                      <TableCell className="font-semibold text-xs text-muted-foreground">
                        {menu.order ?? 0}
                      </TableCell>

                      <TableCell className="font-bold text-sm">
                        {menu.title}
                      </TableCell>

                      <TableCell className="text-muted-foreground/70 font-mono text-xs">
                        {menu.icon || '—'}
                      </TableCell>
                      
                      <TableCell className="text-xs font-mono text-blue-600 dark:text-blue-400">
                        {menu.url || '—'}
                      </TableCell>

                      <TableCell>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${menu.isCollapsible ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                          {menu.isCollapsible.toString()}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {menu.subMenus && menu.subMenus.length > 0 ? (
                            menu.subMenus.map(sm => (
                              <span key={sm.id} className="bg-muted border text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">{sm.title} ({sm.order ?? 0})</span>
                            ))
                          ) : <span className="text-xs text-muted-foreground opacity-50">—</span>}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(menu)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(menu.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
