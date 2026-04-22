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
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  User 
} from "@/api/userApi"
import { getRoles, Role } from "@/api/rolesApi"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  
  // Form State
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [roleId, setRoleId] = React.useState<string>("")
  const [password, setPassword] = React.useState("")
  const [status, setStatus] = React.useState("ACTIVE")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles()
      ])
      setUsers(usersData)
      setRoles(rolesData)
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !roleId) {
      return toast.error("Please fill in all required fields.")
    }

    try {
      if (currentUser) {
        await updateUser(currentUser.id, { 
          name, 
          email: email || undefined, 
          phone, 
          roleId: parseInt(roleId), 
          password: password || undefined,
          status
        })
        toast.success("User updated successfully")
      } else {
        if (!password) return toast.error("Password is required for new users.")
        await createUser({ 
          name, 
          email: email || undefined, 
          phone, 
          roleId: parseInt(roleId), 
          password,
          status
        })
        toast.success("User created successfully")
      }
      setIsModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "An error occurred"
      toast.error(errMsg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await deleteUser(id)
      toast.success("User deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  const openEditModal = (user: User) => {
    setCurrentUser(user)
    setName(user.name)
    setEmail(user.email || "")
    setPhone(user.phone)
    setRoleId(user.roleId.toString())
    setStatus(user.status)
    setPassword("") // Clear password field for empty-patch intent
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentUser(null)
    setName("")
    setEmail("")
    setPhone("")
    setRoleId("")
    setStatus("ACTIVE")
    setPassword("")
  }

  // Define columns for DataTable
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-medium text-muted-foreground">#{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-semibold text-foreground">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("email") || "No email"}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div className="text-sm">{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "role.name",
      header: "Role",
      cell: ({ row }) => (
        <span className="font-semibold text-muted-foreground">
          {row.original.role?.name || "No Role"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${row.getValue("status") === 'ACTIVE' ? 'bg-[#dcfce7] text-[#166534] ring-[#bbf7d0] dark:bg-[#064e3b] dark:text-[#6ee7b7] dark:ring-[#047857]' : 'bg-[#fee2e2] text-[#991b1b] ring-[#fecaca] dark:bg-[#7f1d1d] dark:text-[#fca5a5] dark:ring-[#b91c1c]'}`}>
          {row.getValue("status")}
        </span>
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
              <h1 className="text-2xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground">Manage administrative accounts and their roles.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="btn-category">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{currentUser ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name <span className="text-red-500">*</span></Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Full Name" required />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="Optional email" />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone <span className="text-red-500">*</span></Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" placeholder="Phone Number" required />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role <span className="text-red-500">*</span></Label>
                    <div className="col-span-3">
                      <Select value={roleId} onValueChange={setRoleId} required>
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status <span className="text-red-500">*</span></Label>
                    <div className="col-span-3">
                      <Select value={status} onValueChange={setStatus} required>
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                          <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password {currentUser ? "" : <span className="text-red-500">*</span>}</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="col-span-3" 
                      placeholder={currentUser ? "Leave blank to keep unchanged" : "Secure Password"} 
                      required={!currentUser}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" className="btn-category mt-4">
                      {currentUser ? "Update User" : "Save User"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <DataTable 
            columns={columns} 
            data={users} 
            isLoading={isLoading} 
            filterColumn="name"
            filterPlaceholder="Search users by name..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
