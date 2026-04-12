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
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, FileTextIcon, UserIcon, HomeIcon, DollarSignIcon, EyeIcon, DownloadIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { getSales, createSale, updateSale, deleteSale, Sale } from "@/api/saleApi"
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

export default function SalePage() {
  const [sales, setSales] = React.useState<Sale[]>([])
  const [properties, setProperties] = React.useState<Property[]>([])
  const [buyers, setBuyers] = React.useState<User[]>([])
  
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentSale, setCurrentSale] = React.useState<Sale | null>(null)
  
  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false)
  const [viewSale, setViewSale] = React.useState<Sale | null>(null)
  
  // Form State
  const [propertyId, setPropertyId] = React.useState<string>("")
  const [buyerId, setBuyerId] = React.useState<string>("")
  const [price, setPrice] = React.useState("")
  const [document, setDocument] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [salesData, propsData, usersData] = await Promise.all([
        getSales(),
        getProperties(),
        getUsers()
      ])
      setSales(salesData)
      setProperties(propsData.filter(p => p.listingType === 'SALE' && p.status === 'AVAILABLE'))
      setBuyers(usersData.filter(u => u.role?.name === "User"))
    } catch (error) {
      toast.error("Failed to load property sales data")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId || !buyerId || !price) {
      return toast.error("Required fields: Property, Buyer, and Sale Price.")
    }

    try {
      const formData = new FormData()
      formData.append("propertyId", propertyId)
      formData.append("buyerId", buyerId)
      formData.append("price", price)
      if (document) {
        formData.append("document", document)
      }

      if (currentSale) {
        await updateSale(currentSale.id, formData)
        toast.success("Sales record updated successfully")
      } else {
        await createSale(formData)
        toast.success("Property sale registered successfully")
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
    if (!confirm("Are you sure you want to remove this sale record? This action is permanent!")) return

    try {
      await deleteSale(id)
      toast.success("Sales record deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete sales record")
    }
  }

  const openEditModal = (sale: Sale) => {
    setCurrentSale(sale)
    setPropertyId(sale.propertyId.toString())
    setBuyerId(sale.buyerId.toString())
    setPrice(sale.price.toString())
    setDocument(null)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentSale(null)
    setPropertyId("")
    setBuyerId("")
    setPrice("")
    setDocument(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const openViewModal = (sale: Sale) => {
    setViewSale(sale)
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
              <h1 className="text-2xl font-bold tracking-tight">Property Sales</h1>
              <p className="text-muted-foreground">Register and track property sales, buyers and legal documentation.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="btn-category shrink-0">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Record New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{currentSale ? "Modify Sale Transaction" : "New Property Sale Entry"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  
                  {/* Property Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="propertyId">Select Property <span className="text-red-500">*</span></Label>
                    <Select value={propertyId} onValueChange={setPropertyId} required>
                      <SelectTrigger id="propertyId">
                        <SelectValue placeholder="Select property for sale" />
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

                  {/* Buyer Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="buyerId">Assign Buyer <span className="text-red-500">*</span></Label>
                    <Select value={buyerId} onValueChange={setBuyerId} required>
                      <SelectTrigger id="buyerId">
                        <SelectValue placeholder="Identify the buyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {buyers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.name} - {user.phone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sale Price */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="price">Final Sale Price ($) <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="price" type="number" step="0.01" className="pl-9" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-2 md:col-span-2 p-4 bg-muted/20 border rounded-lg">
                    <Label htmlFor="document" className="flex items-center gap-2 mb-2 font-semibold">
                      <FileTextIcon className="h-4 w-4" /> Proof of Ownership / Sales Contract
                    </Label>
                    <Input id="document" type="file" ref={fileInputRef} onChange={handleFileChange} className="bg-background cursor-pointer" />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {currentSale?.documentUrl ? "Existing document will be kept if no new file is uploaded." : "Upload the signed sales agreement (PDF or Image)."}
                    </p>
                  </div>
                  
                  <DialogFooter className="md:col-span-2 mt-4">
                    <Button type="submit" className="btn-category w-full">
                      {currentSale ? "Update Transaction" : "Confirm Property Sale"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Sales Transaction Information</DialogTitle>
                </DialogHeader>
                {viewSale && (
                  <div className="space-y-6 py-4">
                    <div className="p-4 bg-muted/40 rounded-lg border">
                      <h3 className="font-bold flex items-center gap-2 text-[#166534] mb-2 uppercase text-xs tracking-wider">
                        <HomeIcon className="h-4 w-4" /> Physical Asset
                      </h3>
                      <p className="text-sm font-bold">{viewSale.property?.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{viewSale.property?.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/40 rounded-lg border">
                        <h3 className="font-bold flex items-center gap-2 text-primary mb-2 uppercase text-xs tracking-wider">
                          <UserIcon className="h-4 w-4" /> Registered Buyer
                        </h3>
                        <p className="text-sm font-bold">{viewSale.buyer?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">{viewSale.buyer?.phone}</p>
                      </div>

                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                        <h3 className="font-bold flex items-center gap-2 mb-2 uppercase text-xs tracking-wider">
                          <DollarSignIcon className="h-4 w-4" /> Transaction Value
                        </h3>
                        <p className="text-lg font-bold">${viewSale.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-4 border border-dashed rounded-lg bg-muted/10">
                      <h3 className="font-bold flex items-center gap-2 text-muted-foreground mb-3 text-xs uppercase tracking-wider">
                        <FileTextIcon className="h-4 w-4" /> Attached Document
                      </h3>
                      {viewSale.documentUrl ? (
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                                  <FileTextIcon className="h-5 w-5 text-primary" />
                               </div>
                               <span className="text-sm font-medium">SalesContract.pdf</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                               <a href={viewSale.documentUrl.startsWith('http') ? viewSale.documentUrl : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://property-management-system-production-e024.up.railway.app'}${viewSale.documentUrl}`} target="_blank" rel="noopener noreferrer">
                                  <DownloadIcon className="h-4 w-4 mr-2" /> Download
                               </a>
                            </Button>
                         </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic text-center py-2">No legal documentation attached for this sale.</p>
                      )}
                    </div>

                    <div className="text-[10px] text-center text-muted-foreground uppercase opacity-50 font-bold">
                       Transaction Recorded: {format(new Date(viewSale.createdAt), "PPP")}
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
                  <TableHead>Buyer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>createdAt</TableHead>
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
                        <span>Aggregating sales records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <DollarSignIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p>No property sales have been recorded yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs">{sale.id}</TableCell>

                      <TableCell>
                        <div className="font-bold text-sm leading-tight">{sale.property?.title}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold text-sm">{sale.buyer?.name}</div>
                      </TableCell>

                      <TableCell className="font-bold text-blue-600 dark:text-blue-400">
                        ${sale.price.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {sale.documentUrl || "null"}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {format(new Date(sale.createdAt), "MMM d, yyyy")}
                      </TableCell>

                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${
                          sale.property?.status === 'SOLD' 
                            ? "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:ring-blue-800"
                            : "bg-green-100 text-green-800 ring-green-200 dark:bg-green-900 dark:text-green-300 dark:ring-green-800"
                        }`}>
                          {sale.property?.status}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openViewModal(sale)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(sale)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(sale.id)}
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
