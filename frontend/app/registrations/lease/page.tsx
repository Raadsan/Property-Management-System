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
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, CalendarIcon, UserIcon, HomeIcon, DollarSignIcon, EyeIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { getLeases, createLease, updateLease, deleteLease, Lease } from "@/api/leaseApi"
import { getProperties, Property } from "@/api/propertyApi"
import { getUsers, User } from "@/api/userApi"

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

export default function LeasePage() {
  const [leases, setLeases] = React.useState<Lease[]>([])
  const [properties, setProperties] = React.useState<Property[]>([])
  const [tenants, setTenants] = React.useState<User[]>([])
  
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentLease, setCurrentLease] = React.useState<Lease | null>(null)
  
  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false)
  const [viewLease, setViewLease] = React.useState<Lease | null>(null)
  
  // Form State
  const [propertyId, setPropertyId] = React.useState<string>("")
  const [tenantId, setTenantId] = React.useState<string>("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [rentAmount, setRentAmount] = React.useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [leasesData, propsData, usersData] = await Promise.all([
        getLeases(),
        getProperties(),
        getUsers()
      ])
      setLeases(leasesData)
      setProperties(propsData.filter(p => p.listingType === 'RENT' && p.status === 'AVAILABLE'))
      setTenants(usersData.filter(u => u.role?.name === "User"))
    } catch (error) {
      toast.error("Failed to load lease management data")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId || !tenantId || !startDate || !endDate || !rentAmount) {
      return toast.error("Please fill in all strictly required fields.")
    }

    try {
      const payload = {
        propertyId: parseInt(propertyId),
        tenantId: parseInt(tenantId),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        rentAmount: parseFloat(rentAmount)
      }

      if (currentLease) {
        await updateLease(currentLease.id, payload)
        toast.success("Lease agreement updated successfully")
      } else {
        await createLease(payload)
        toast.success("Lease agreement registered successfully")
      }
      
      setIsModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "An error occurred while saving"
      toast.error(errMsg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to terminate this lease? This action is permanent!")) return

    try {
      await deleteLease(id)
      toast.success("Lease record deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete lease record")
    }
  }

  const openEditModal = (lease: Lease) => {
    setCurrentLease(lease)
    setPropertyId(lease.propertyId.toString())
    setTenantId(lease.tenantId.toString())
    setStartDate(lease.startDate.split('T')[0])
    setEndDate(lease.endDate.split('T')[0])
    setRentAmount(lease.rentAmount.toString())
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentLease(null)
    setPropertyId("")
    setTenantId("")
    setStartDate("")
    setEndDate("")
    setRentAmount("")
  }

  const openViewModal = (lease: Lease) => {
    setViewLease(lease)
    setIsViewModalOpen(true)
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
              <h1 className="text-2xl font-bold tracking-tight">Lease Management</h1>
              <p className="text-muted-foreground">Track property rentals, tenant agreements, and rent schedules.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="btn-category shrink-0">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Lease Agreement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{currentLease ? "Modify Lease Record" : "Registration of New Lease"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  
                  {/* Property Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="propertyId">Select Property <span className="text-red-500">*</span></Label>
                    <Select value={propertyId} onValueChange={setPropertyId} required>
                      <SelectTrigger id="propertyId">
                        <SelectValue placeholder="Choose a property for rent" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((prop) => (
                          <SelectItem key={prop.id} value={prop.id.toString()}>
                            {prop.title} ({prop.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tenant Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="tenantId">Assign Tenant <span className="text-red-500">*</span></Label>
                    <Select value={tenantId} onValueChange={setTenantId} required>
                      <SelectTrigger id="tenantId">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.name} - {user.phone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rent Amount */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rentAmount">Monthly Rent Amount ($) <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="rentAmount" type="number" step="0.01" className="pl-9" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="0.00" required />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Lease Start Date <span className="text-red-500">*</span></Label>
                    <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Lease End Date <span className="text-red-500">*</span></Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                  
                  <DialogFooter className="md:col-span-2 mt-4">
                    <Button type="submit" className="btn-category w-full">
                      {currentLease ? "Update Agreement" : "Execute Lease Agreement"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Lease Summary</DialogTitle>
                </DialogHeader>
                {viewLease && (
                  <div className="space-y-6 py-4">
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <h3 className="font-bold flex items-center gap-2 text-primary mb-2">
                        <HomeIcon className="h-4 w-4" /> Property Information
                      </h3>
                      <p className="text-sm font-medium">{viewLease.property?.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{viewLease.property?.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <h3 className="font-bold flex items-center gap-2 text-primary mb-2">
                          <UserIcon className="h-4 w-4" /> Tenant
                        </h3>
                        <p className="text-sm font-medium">{viewLease.tenant?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{viewLease.tenant?.phone}</p>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg border text-emerald-600 dark:text-emerald-400">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                          <DollarSignIcon className="h-4 w-4" /> Monthly Rent
                        </h3>
                        <p className="text-lg font-bold">${viewLease.rentAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <h3 className="font-bold flex items-center gap-2 text-primary mb-3">
                        <CalendarIcon className="h-4 w-4" /> Contract Period
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Start Date</p>
                          <p className="font-medium">{format(new Date(viewLease.startDate), "PPP")}</p>
                        </div>
                        <div className="h-px bg-muted flex-1 mx-4" />
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">End Date</p>
                          <p className="font-medium">{format(new Date(viewLease.endDate), "PPP")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>id</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>startDate</TableHead>
                  <TableHead>endDate</TableHead>
                  <TableHead>rentAmount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span>Fetching active leases...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p>No active lease agreements found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leases.map((lease) => (
                    <TableRow key={lease.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs">{lease.id}</TableCell>
                      
                      <TableCell>
                        <div className="font-bold text-sm leading-tight">{lease.property?.title}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold text-sm">{lease.tenant?.name}</div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-medium">{format(new Date(lease.startDate), "MMM d, yyyy")}</div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-medium">{format(new Date(lease.endDate), "MMM d, yyyy")}</div>
                      </TableCell>

                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${lease.rentAmount.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${
                          lease.property?.status === 'RENTED' 
                            ? "bg-purple-100 text-purple-800 ring-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:ring-purple-800"
                            : "bg-green-100 text-green-800 ring-green-200 dark:bg-green-900 dark:text-green-300 dark:ring-green-800"
                        }`}>
                          {lease.property?.status}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openViewModal(lease)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(lease)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(lease.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <TrashIcon className="h-4 w-4" />
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
