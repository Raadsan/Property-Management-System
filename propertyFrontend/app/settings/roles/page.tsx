"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon } from "lucide-react"
import { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole,
  Role 
} from "@/api/rolesApi"
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
import { toast } from "sonner"

export default function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentRole, setCurrentRole] = React.useState<Role | null>(null)
  
  // Form State
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const data = await getRoles()
      setRoles(data)
    } catch (error) {
      toast.error("Failed to fetch roles")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchRoles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (currentRole) {
        await updateRole(currentRole.id, { name, description })
        toast.success("Role updated successfully")
      } else {
        await createRole({ name, description })
        toast.success("Role created successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchRoles()
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return

    try {
      await deleteRole(id)
      toast.success("Role deleted successfully")
      fetchRoles()
    } catch (error) {
      toast.error("Failed to delete role")
    }
  }

  const openEditModal = (role: Role) => {
    setCurrentRole(role)
    setName(role.name)
    setDescription(role.description || "")
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentRole(null)
    setName("")
    setDescription("")
  }

  // Define columns for DataTable
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-medium text-muted-foreground">#{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => <div className="font-semibold text-foreground">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue("description") ? (
            row.getValue("description")
          ) : (
            <span className="italic opacity-50 text-[10px]">No description provided</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => openEditModal(row.original)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
              <p className="text-muted-foreground">Manage system roles and their descriptions.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="btn-category">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{currentRole ? "Edit Role" : "Add New Role"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="col-span-3" 
                      placeholder="e.g. Admin, Manager"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right flex flex-col justify-center">
                      <span>Description</span>
                      <span className="text-[10px] text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      className="col-span-3" 
                      placeholder="Role privileges overview"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="btn-category">
                      {currentRole ? "Update" : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <DataTable 
            columns={columns} 
            data={roles} 
            isLoading={isLoading} 
            filterColumn="name"
            filterPlaceholder="Search roles by name..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
