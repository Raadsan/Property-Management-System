"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, EyeIcon } from "lucide-react"
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserById,
  User 
} from "@/api/userApi"
import { getRoles, Role } from "@/api/rolesApi"
import { usePagePermissions } from "@/hooks/usePagePermissions"
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
import { useLocations } from "@/hooks/useLocations"
import ReactSelect from "react-select"
import { locationSelectStyles, LOCATION_SELECT_MENU_HEIGHT } from "@/lib/locationSelectStyles"

export default function UsersPage() {
  const permissions = usePagePermissions("/settings/users")
  const { cityOptions, cityNames, getDistrictOptions, cityHasDistricts } = useLocations()
  const [users, setUsers] = React.useState<User[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false)
  const [viewUser, setViewUser] = React.useState<User | null>(null)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  
  // Filtering State
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [filterRole, setFilterRole] = React.useState<string>("all")
  const [filterCity, setFilterCity] = React.useState<string>("all")
  const [filterDistrict, setFilterDistrict] = React.useState<string>("all")
  
  // Form State
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [secondaryPhone, setSecondaryPhone] = React.useState("")
  const [city, setCity] = React.useState("")
  const [district, setDistrict] = React.useState("")
  const [roleId, setRoleId] = React.useState<string>("")
  const [password, setPassword] = React.useState("")
  const [status, setStatus] = React.useState("ACTIVE")

  const agentRoleId = React.useMemo(
    () => roles.find((r) => r.name.toLowerCase() === "agent")?.id,
    [roles]
  )

  const isAgentRole = agentRoleId != null && roleId === agentRoleId.toString()

  const isAgentUser = React.useCallback(
    (user: User) => agentRoleId != null && user.roleId === agentRoleId,
    [agentRoleId]
  )

  const agentPayload = React.useMemo(() => {
    if (isAgentRole) {
      return {
        secondaryPhone: secondaryPhone.trim() || null,
        city: city.trim() || null,
        district: district.trim() || null,
      }
    }
    return {
      secondaryPhone: null,
      city: null,
      district: null,
    }
  }, [isAgentRole, secondaryPhone, city, district])

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true)
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
      if (!silent) setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !roleId) {
      return toast.error("Please fill in all required fields.")
    }

    try {
      setIsSaving(true)
      if (currentUser) {
        await updateUser(currentUser.id, { 
          name, 
          email, 
          phone, 
          roleId: parseInt(roleId), 
          password: password || undefined,
          status,
          ...agentPayload,
        })
        toast.success("User updated successfully")
      } else {
        if (!password) return toast.error("Password is required for new users.")
        await createUser({ 
          name, 
          email, 
          phone, 
          roleId: parseInt(roleId), 
          password,
          status,
          ...agentPayload,
        })
        toast.success("User created successfully")
      }
      setIsModalOpen(false)
      resetForm()
      await loadData(true)
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "An error occurred"
      toast.error(errMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      setDeletingId(id)
      await deleteUser(id)
      toast.success("User deleted successfully")
      await loadData(true)
    } catch (error) {
      toast.error("Failed to delete user")
    } finally {
      setDeletingId(null)
    }
  }

  const openEditModal = (user: User) => {
    setCurrentUser(user)
    setName(user.name)
    setEmail(user.email || "")
    setPhone(user.phone)
    setSecondaryPhone(user.secondaryPhone || "")
    setCity(user.city || "")
    setDistrict(user.district || "")
    setRoleId(user.roleId.toString())
    setStatus(user.status)
    setPassword("") // Clear password field for empty-patch intent
    setIsModalOpen(true)
  }

  const openViewModal = async (user: User) => {
    setViewUser(user)
    setIsViewModalOpen(true)
    try {
      const fresh = await getUserById(user.id)
      setViewUser(fresh)
    } catch {
      // Keep list row data if detail fetch fails
    }
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
    setSecondaryPhone("")
    setCity("")
    setDistrict("")
    setRoleId("")
    setStatus("ACTIVE")
    setPassword("")
  }

  const citiesList = React.useMemo(() => {
    const fromApi = cityNames
    const fromDb = users.map((u) => u.city).filter(Boolean) as string[]
    return Array.from(new Set([...fromApi, ...fromDb]))
  }, [users, cityNames])

  const districtsList = React.useMemo(() => {
    if (filterCity === "all") {
      return Array.from(new Set(users.map((u) => u.district).filter(Boolean))) as string[]
    }
    const targetCity =
      filterCity === "Muqdisho" || filterCity === "Mogadishu" ? "Mogadishu" : filterCity
    const preDefined = getDistrictOptions(targetCity).map((d) => d.value)
    const savedInDb = users
      .filter(
        (u) =>
          u.city === filterCity ||
          (targetCity === "Mogadishu" && (u.city === "Mogadishu" || u.city === "Muqdisho"))
      )
      .map((u) => u.district)
      .filter(Boolean) as string[]
    return Array.from(new Set([...preDefined, ...savedInDb]))
  }, [users, filterCity, getDistrictOptions])

  // Filtered Data
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchStatus = filterStatus === "all" || user.status === filterStatus
      const matchRole = filterRole === "all" || user.roleId.toString() === filterRole
      const matchCity =
        filterCity === "all" ||
        user.city === filterCity ||
        (filterCity === "Muqdisho" && user.city === "Mogadishu") ||
        (filterCity === "Mogadishu" && user.city === "Muqdisho")
      const matchDistrict = filterDistrict === "all" || user.district === filterDistrict
      return matchStatus && matchRole && matchCity && matchDistrict
    })
  }, [users, filterStatus, filterRole, filterCity, filterDistrict])

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
            onClick={() => openViewModal(row.original)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            title="View User Details"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          {permissions.canEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => openEditModal(row.original)}
              disabled={isSaving || deletingId !== null}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          {permissions.canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(row.original.id)}
              disabled={isSaving || deletingId === row.original.id}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deletingId === row.original.id ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
<div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground">Manage administrative accounts and their roles.</p>
            </div>
            {permissions.canAdd && (
              <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open && isSaving) return;
                if (!open) resetForm();
                setIsModalOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateModal} className="btn-category">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                  <DialogTitle>{currentUser ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4" autoComplete="off">
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name <span className="text-red-500">*</span></Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Full Name" required />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="user@example.com" autoComplete="off" required />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone <span className="text-red-500">*</span></Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" placeholder="Phone Number" required />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role <span className="text-red-500">*</span></Label>
                    <div className="col-span-3 min-w-0">
                      <Select
                        value={roleId}
                        onValueChange={(value) => {
                          setRoleId(value)
                          if (agentRoleId == null || parseInt(value) !== agentRoleId) {
                            setSecondaryPhone("")
                            setCity("")
                            setDistrict("")
                          }
                        }}
                        required
                      >
                        <SelectTrigger id="role" className="w-full max-w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id.toString()} className="truncate">
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isAgentRole && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="secondaryPhone" className="text-right">Secondary Phone</Label>
                        <Input
                          id="secondaryPhone"
                          value={secondaryPhone}
                          onChange={(e) => setSecondaryPhone(e.target.value)}
                          className="col-span-3"
                          placeholder="Secondary Phone Number"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">City</Label>
                        <div className="col-span-3 min-w-0">
                          <ReactSelect
                            instanceId="user-city-select"
                            inputId="city"
                            options={cityOptions}
                            value={city ? { value: city, label: city } : null}
                            onChange={(opt) => {
                              setCity(opt?.value || "")
                              setDistrict("")
                            }}
                            placeholder="Select a city"
                            isSearchable
                            maxMenuHeight={LOCATION_SELECT_MENU_HEIGHT}
                            menuPlacement="auto"
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            classNamePrefix="react-select"
                            styles={locationSelectStyles}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="district" className="text-right">District</Label>
                        <div className="col-span-3 min-w-0">
                          <ReactSelect
                            instanceId="user-district-select"
                            inputId="district"
                            options={getDistrictOptions(city)}
                            value={district ? { value: district, label: district } : null}
                            onChange={(opt) => setDistrict(opt?.value || "")}
                            isDisabled={!cityHasDistricts(city)}
                            placeholder={cityHasDistricts(city) ? "Select a district" : "No districts for this city"}
                            isSearchable
                            isClearable
                            maxMenuHeight={LOCATION_SELECT_MENU_HEIGHT}
                            menuPlacement="auto"
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            classNamePrefix="react-select"
                            styles={locationSelectStyles}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status <span className="text-red-500">*</span></Label>
                    <div className="col-span-3 min-w-0">
                      <Select value={status} onValueChange={setStatus} required>
                        <SelectTrigger id="status" className="w-full max-w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
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
                      autoComplete="new-password"
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isSaving} className="btn-category mt-4">
                      {isSaving ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          {currentUser ? "Updating..." : "Saving..."}
                        </>
                      ) : (
                        currentUser ? "Update User" : "Save User"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>
              {viewUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 py-4 text-sm">
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">ID</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">#{viewUser.id}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Status</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.status}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-muted-foreground block mb-1">Name</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-muted-foreground block mb-1">Email</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.email || "No email"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Phone</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.phone}</p>
                  </div>
                  {isAgentUser(viewUser) && (
                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Secondary Phone</span>
                      <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.secondaryPhone || "-"}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Role</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.role?.name || "No Role"}</p>
                  </div>
                  {isAgentUser(viewUser) && (
                    <>
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">City</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.city || "-"}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">District</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md">{viewUser.district || "-"}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Created</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">
                      {new Date(viewUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Updated</span>
                    <p className="font-medium bg-muted/40 p-2 rounded-md">
                      {new Date(viewUser.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

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
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Role Filter</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-9 border-border bg-card">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">City Filter</Label>
              <Select
                value={filterCity}
                onValueChange={(val) => {
                  setFilterCity(val)
                  setFilterDistrict("all")
                }}
              >
                <SelectTrigger className="h-9 border-border bg-card">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {citiesList.map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">District Filter</Label>
              <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                <SelectTrigger className="h-9 border-border bg-card">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districtsList.map((districtName) => (
                    <SelectItem key={districtName} value={districtName}>
                      {districtName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setFilterStatus("all")
                setFilterRole("all")
                setFilterCity("all")
                setFilterDistrict("all")
              }}
              className="text-xs font-bold text-muted-foreground h-9"
            >
              Reset Filters
            </Button>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredUsers} 
            isLoading={isLoading} 
            filterColumn="name"
            filterPlaceholder="Search users by name..."
          />
        </div>
)
}
