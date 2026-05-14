"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, PhoneIcon, MapPinIcon } from "lucide-react"
import { 
  getAgents, 
  createAgent, 
  updateAgent, 
  deleteAgent,
  AgentData 
} from "@/api/agentApi"
import { getRoles, Role } from "@/api/rolesApi"
import { getRolePermissionsById } from "@/api/rolePermissionsApi"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
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

export default function AgentsPage() {
  const [agents, setAgents] = React.useState<AgentData[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentAgent, setCurrentAgent] = React.useState<AgentData | null>(null)
  
  // Permissions State
  const [permissions, setPermissions] = React.useState({
    canAdd: false,
    canEdit: false,
    canDelete: false,
    isLoaded: false
  })
  
  const isReadOnly = !permissions.canEdit && permissions.isLoaded; // backwards compatibility for some parts of code
  
  // Form State
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [primaryPhone, setPrimaryPhone] = React.useState("")
  const [secondaryPhone, setSecondaryPhone] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [city, setCity] = React.useState("")
  const [roleId, setRoleId] = React.useState<string>("")
  const [status, setStatus] = React.useState("ACTIVE")
  const [password, setPassword] = React.useState("")
  
  // Filtering State
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [filterCity, setFilterCity] = React.useState<string>("all")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [agentsData, rolesData] = await Promise.all([
        getAgents(),
        getRoles()
      ])
      setAgents(agentsData.data || [])
      setRoles(rolesData)

      // Pre-set agent roleId if available
      const agentRole = rolesData.find(r => r.name.toLowerCase() === 'agent')
      if (agentRole) {
        setRoleId(agentRole.id.toString())
      }
    } catch (error) {
      toast.error("Failed to load agents data")
    } finally {
      setIsLoading(false)
    }
  }

  const checkPermissions = async () => {
    try {
      const userStr = sessionStorage.getItem("user")
      if (!userStr) return
      const user = JSON.parse(userStr)
      if (!user.roleId) return

      const permsData = await getRolePermissionsById(user.roleId)
      
      // Find the System Settings menu and Agents submenu
      const settingsMenu = permsData.menus.find(m => m.menu?.title === "System Settings")
      const agentSubMenu = settingsMenu?.subMenus?.find(sm => sm.subMenu?.title === "Agents")

      if (agentSubMenu) {
        setPermissions({
          canAdd: agentSubMenu.canAdd,
          canEdit: agentSubMenu.canEdit,
          canDelete: agentSubMenu.canDelete,
          isLoaded: true
        })
      } else {
        // Fallback for Admin
        setPermissions({
          canAdd: true,
          canEdit: true,
          canDelete: true,
          isLoaded: true
        })
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
    }
  }

  React.useEffect(() => {
    loadData()
    checkPermissions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !primaryPhone.trim() || !roleId) {
      return toast.error("Please fill in all required fields.")
    }

    try {
      const payload: AgentData = {
        fullName,
        email,
        primaryPhone,
        secondaryPhone: secondaryPhone || undefined,
        address: address || undefined,
        city: city || undefined,
        roleId: parseInt(roleId),
        status,
        password: password || undefined
      }

      if (currentAgent?.id) {
        await updateAgent(currentAgent.id, payload)
        toast.success("Agent updated successfully")
      } else {
        await createAgent(payload)
        toast.success("Agent created successfully")
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
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      await deleteAgent(id)
      toast.success("Agent deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete agent")
    }
  }

  const openEditModal = (agent: AgentData) => {
    if (isReadOnly) return
    setCurrentAgent(agent)
    setFullName(agent.fullName)
    setEmail(agent.email)
    setPrimaryPhone(agent.primaryPhone)
    setSecondaryPhone(agent.secondaryPhone || "")
    setAddress(agent.address || "")
    setCity(agent.city || "")
    setRoleId(agent.roleId.toString())
    setStatus(agent.status)
    setPassword("") // Clear for security
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentAgent(null)
    setFullName("")
    setEmail("")
    setPrimaryPhone("")
    setSecondaryPhone("")
    setAddress("")
    setCity("")
    // Keep agent role selected
    const agentRole = roles.find(r => r.name.toLowerCase() === 'agent')
    if (agentRole) {
      setRoleId(agentRole.id.toString())
    } else {
      setRoleId("")
    }
    setStatus("ACTIVE")
    setPassword("")
  }

  // Derived Data
  const cities = React.useMemo(() => {
    const uniqueCities = new Set(agents.map(a => a.city).filter(Boolean))
    return Array.from(uniqueCities)
  }, [agents])

  const filteredAgents = React.useMemo(() => {
    return agents.filter(agent => {
      const matchStatus = filterStatus === "all" || agent.status === filterStatus
      const matchCity = filterCity === "all" || agent.city === filterCity
      return matchStatus && matchCity
    })
  }, [agents, filterStatus, filterCity])

  // Define columns for DataTable
  const columns: ColumnDef<AgentData>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.getValue("fullName")}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "primaryPhone",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-1">
            <PhoneIcon className="h-3 w-3 text-muted-foreground" />
            {row.getValue("primaryPhone")}
          </div>
          {row.original.secondaryPhone && (
            <div className="text-xs text-muted-foreground ml-4">
              {row.original.secondaryPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPinIcon className="h-3 w-3" />
          {row.getValue("city") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "role.name",
      header: "Role",
      cell: ({ row }) => (
        <span className="font-medium text-muted-foreground">
          {row.original.role?.name || "No Role"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${row.getValue("status") === 'ACTIVE' ? 'bg-[#dcfce7] text-[#166534] ring-[#bbf7d0]' : 'bg-[#fee2e2] text-[#991b1b] ring-[#fecaca]'}`}>
          {row.getValue("status")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {permissions.canEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => openEditModal(row.original)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          {permissions.canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => row.original.id && handleDelete(row.original.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
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
              <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
              <p className="text-muted-foreground">Manage property agents and their details.</p>
            </div>
            {permissions.canAdd && (
              <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsModalOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateModal} className="btn-category">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                  <DialogTitle>{currentAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
                  <DialogDescription>
                    {currentAgent ? "Update the details of the selected agent." : "Fill in the details to register a new property agent."}
                  </DialogDescription>
                </DialogHeader>
                  <form onSubmit={handleSubmit} className="grid gap-4 py-4" autoComplete="off">
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fullName" className="text-right">Full Name <span className="text-red-500">*</span></Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="col-span-3" placeholder="Full Name" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email <span className="text-red-500">*</span></Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="Email Address" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="primaryPhone" className="text-right">Primary Phone <span className="text-red-500">*</span></Label>
                      <Input id="primaryPhone" value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} className="col-span-3" placeholder="Primary Phone Number" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="secondaryPhone" className="text-right">Secondary Phone</Label>
                      <Input id="secondaryPhone" value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} className="col-span-3" placeholder="Optional Phone Number" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="city" className="text-right">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-3" placeholder="City" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">Address</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" placeholder="Address" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Role <span className="text-red-500">*</span></Label>
                      <div className="col-span-3">
                        <Select value={roleId} onValueChange={setRoleId} required>
                          <SelectTrigger id="role" className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                          {roles.filter(r => r.name.toLowerCase() === 'agent').map((r) => (
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
                    <Label htmlFor="password" className="text-right">Password {currentAgent ? "" : <span className="text-red-500">*</span>}</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="col-span-3" 
                      placeholder={currentAgent ? "Leave blank to keep unchanged" : "Secure Password"} 
                      required={!currentAgent}
                      autoComplete="new-password"
                    />
                  </div>
                  
                  <DialogFooter>
                      <Button type="submit" className="btn-category mt-4">
                        {currentAgent ? "Update Agent" : "Save Agent"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-6 items-end">
            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Status Filter</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 border-border bg-card">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">City Filter</Label>
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="h-9 border-border bg-card">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city!}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setFilterStatus("all"); setFilterCity("all"); }}
              className="text-xs font-bold text-muted-foreground h-9"
            >
              Reset Filters
            </Button>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredAgents} 
            isLoading={isLoading} 
            filterColumn="fullName"
            filterPlaceholder="Search agents by name..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
