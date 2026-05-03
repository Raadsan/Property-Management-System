"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, ImageIcon, HomeIcon, EyeIcon } from "lucide-react"

import { getPropertyTypes, Category } from "@/api/propertyTypeApi"
import { getUsers, User } from "@/api/userApi"
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  bookProperty,
  Property
} from "@/api/propertyApi"

import { Country, City } from "country-state-city"
import ReactSelect from "react-select"

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

export default function PropertiesPage() {
  const [properties, setProperties] = React.useState<Property[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [owners, setOwners] = React.useState<User[]>([])
  const [agents, setAgents] = React.useState<User[]>([])

  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentProperty, setCurrentProperty] = React.useState<Property | null>(null)

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false)
  const [viewProperty, setViewProperty] = React.useState<Property | null>(null)

  // Form State
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [selectedCity, setSelectedCity] = React.useState("")
  const [selectedCountry, setSelectedCountry] = React.useState("Somalia")
  const [price, setPrice] = React.useState("")
  const [status, setStatus] = React.useState<string>("AVAILABLE")
  const [propertyTypeId, setPropertyTypeId] = React.useState<string>("")
  const [ownerId, setOwnerId] = React.useState<string>("")
  const [agentId, setAgentId] = React.useState<string>("")
  const [listingType, setListingType] = React.useState<string>("RENT")
  const [sizeLabel, setSizeLabel] = React.useState("")
  const [area, setArea] = React.useState("")
  const [rooms, setRooms] = React.useState("")
  const [bathrooms, setBathrooms] = React.useState("")
  const [reservationFee, setReservationFee] = React.useState("0.01")
  const [featuresInput, setFeaturesInput] = React.useState("")

  // 🌍 Derived Location Data for Searchable Selects
  const countryData = React.useMemo(() => Country.getAllCountries(), []);
  const currentCountryObj = countryData.find(c => c.name === selectedCountry);
  const countryIso = currentCountryObj?.isoCode || "SO";
  const cityOptions = React.useMemo(() => 
    (City.getCitiesOfCountry(countryIso) || []).map(c => ({ value: c.name, label: c.name })),
    [countryIso]
  );
  const countryOptions = React.useMemo(() => 
    countryData.map(c => ({ value: c.isoCode, label: c.name })),
    [countryData]
  );

  // File State
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false)
  const [bookingProperty, setBookingProperty] = React.useState<Property | null>(null)
  const [wafiPhone, setWafiPhone] = React.useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [propsData, catsData, usersData] = await Promise.all([
        getProperties(),
        getPropertyTypes(),
        getUsers()
      ])
      setProperties(propsData)
      setCategories(catsData)

      // Filter users to only show those with the 'Owner' role
      const ownersOnly = usersData.filter(user => user.role?.name === "Owner")
      setOwners(ownersOnly)

      // Filter users to only show those with the 'Agent' role
      const agentsOnly = usersData.filter(user => user.role?.name === "Agent")
      setAgents(agentsOnly)
    } catch (error) {
      toast.error("Failed to load property data")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !location || !selectedCity || !price || !ownerId || !propertyTypeId || !agentId) {
      return toast.error("Please fill in all strictly required fields.")
    }

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("location", location)
      formData.append("city", selectedCity)
      formData.append("country", selectedCountry)
      formData.append("price", price)
      formData.append("listingType", listingType)
      formData.append("status", status)
      formData.append("ownerId", ownerId)
      if (agentId) formData.append("agentId", agentId)
      formData.append("propertyTypeId", propertyTypeId)
      if (sizeLabel) formData.append("sizeLabel", sizeLabel)
      if (area) formData.append("area", area)
      if (rooms) formData.append("Rooms", rooms)
      if (bathrooms) formData.append("Bathrooms", bathrooms)
      if (reservationFee) formData.append("ReservationFee", reservationFee)

      // Convert comma separated features into an array string
      if (featuresInput.trim()) {
        const featureArray = featuresInput.split(",").map(f => f.trim()).filter(f => f !== "")
        formData.append("features", JSON.stringify(featureArray))
      }

      // Append images
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("images", file)
        })
      }

      if (currentProperty) {
        await updateProperty(currentProperty.id, formData)
        toast.success("Property updated successfully")
      } else {
        await createProperty(formData)
        toast.success("Property created successfully")
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
    if (!confirm("Are you sure you want to delete this property? This action is permanent!")) return

    try {
      await deleteProperty(id)
      toast.success("Property deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete property")
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingProperty || !wafiPhone) {
      return toast.error("Please provide a Wafi Merchant Phone Number.")
    }

    try {
      const userStr = sessionStorage.getItem("user")
      if (!userStr) {
        toast.error("You must be logged in to book.")
        return
      }
      const user = JSON.parse(userStr)

      await bookProperty(bookingProperty.id, {
        userId: user.id || user.userId, // fallback in case
        phone: wafiPhone
      })

      toast.success("Payment successful via Wafi! Property is secured.")
      setIsBookingModalOpen(false)
      loadData() // Refresh status to BOOKED
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "An error occurred while booking"
      toast.error(`Booking Failed: ${errMsg}`)
    }
  }

  const openBookingModal = (property: Property) => {
    setBookingProperty(property)
    setWafiPhone("252") // Default Somalia prefix
    setIsBookingModalOpen(true)
  }

  const openEditModal = (prop: Property) => {
    if (prop) {
      setCurrentProperty(prop)
      setTitle(prop.title)
      setDescription(prop.description || "")
      setLocation(prop.location)
      setSelectedCity(prop.city)
      setSelectedCountry(prop.country || "Somalia")
      setPrice(prop.price.toString())
      setListingType(prop.listingType)
      setStatus(prop.status)
      setOwnerId(prop.ownerId.toString())
      setAgentId(prop.agentId?.toString() || "")
      setPropertyTypeId(prop.propertyTypeId.toString())
      setSizeLabel(prop.sizeLabel || "")
      setArea(prop.area?.toString() || "")
      setRooms(prop.Rooms?.toString() || "")
      setBathrooms(prop.Bathrooms?.toString() || "")
      setReservationFee(prop.ReservationFee?.toString() || "0.01")
      setFeaturesInput(prop.features?.map(f => f.name).join(", ") || "")
    } else {
      setCurrentProperty(null)
      setTitle("")
      setDescription("")
      setLocation("")
      setSelectedCity("")
      setSelectedCountry("Somalia")
      setPrice("")
      setListingType("RENT")
      setStatus("AVAILABLE")
      setOwnerId("")
      setAgentId("")
      setPropertyTypeId("")
      setSizeLabel("")
      setArea("")
      setRooms("")
      setBathrooms("")
      setReservationFee("0.01")
      setFeaturesInput("")
    }

    setSelectedFiles([])
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentProperty(null)
    setTitle("")
    setDescription("")
    setLocation("")
    setSelectedCity("")
    setSelectedCountry("Somalia")
    setPrice("")
    setStatus("AVAILABLE")
    setPropertyTypeId("")
    setOwnerId("")
    setAgentId("")
    setListingType("RENT")
    setSizeLabel("")
    setArea("")
    setRooms("")
    setBathrooms("")
    setReservationFee("0.01")
    setFeaturesInput("")
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openViewModal = (property: Property) => {
    setViewProperty(property)
    setIsViewModalOpen(true)
  }

  // Determine badge styling based on Status
  const getStatusBadge = (status: string) => {
    if (status === "AVAILABLE") return "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0] dark:bg-[#064e3b] dark:text-[#6ee7b7] dark:ring-[#047857]";
    if (status === "SOLD") return "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:ring-blue-800";
    if (status === "RENTED") return "bg-purple-100 text-purple-800 ring-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:ring-purple-800";
    return "bg-gray-100 text-gray-800 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700";
  }

  // Define columns for DataTable
  const columns: ColumnDef<Property>[] = [
    {
      accessorKey: "title",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-bold text-sm line-clamp-1">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "propertyType.name",
      header: "PropertyType",
      cell: ({ row }) => (
        <span className="bg-muted border px-2 py-0.5 rounded text-xs font-medium">
          {row.original.propertyType?.name || 'None'}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-bold text-[#166534] dark:text-[#6ee7b7]">
          ${Number(row.getValue("price")).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "ReservationFee",
      header: "Reservation Fee",
      cell: ({ row }) => (
        <div className="font-semibold text-emerald-600">
          ${Number(row.getValue("ReservationFee") || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "listingType",
      header: "Listing",
      cell: ({ row }) => (
        <div className="text-xs uppercase font-bold tracking-wider opacity-80">
          {row.getValue("listingType")}
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-[200px] text-sm">
          <div className="truncate font-medium">{row.getValue("location")}</div>
          <div className="text-[10px] text-muted-foreground capitalize">{row.original.city}, {row.original.country || "Somalia"}</div>
        </div>
      ),
    },
    {
      accessorKey: "owner.name",
      header: "Owner",
      cell: ({ row }) => (
        <div className="text-sm flex flex-col">
          <span className="font-bold">{row.original.owner?.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{row.original.owner?.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "agent.name",
      header: "Agent",
      cell: ({ row }) => (
        <div className="text-sm flex flex-col">
          <span className="font-bold text-blue-700 dark:text-blue-400">{row.original.agent?.name || 'Unassigned'}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{row.original.agent?.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${getStatusBadge(row.getValue("status") as string)}`}>
          {row.getValue("status")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openViewModal(row.original)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8"
            title="View Property Details"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(row.original)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Properties Inventory</h1>
              <p className="text-muted-foreground">Manage your real estate listings, pricing, and media.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="btn-category shrink-0">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto"
                onPointerDownOutside={(e) => {
                  const target = e.target as Element;
                  if (target.closest('.react-select__menu')) {
                    e.preventDefault();
                  }
                }}
              >
                <DialogHeader>
                  <DialogTitle>{currentProperty ? "Edit Property Parameters" : "Add New Property"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

                  {/* Title */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Headline / Title <span className="text-red-500">*</span></Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Luxurious Downtown Apartment" required />
                  </div>

                  {/* Location Area */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Address / Location <span className="text-red-500">*</span></Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Full Address" />
                  </div>

                  {/* Searchable Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                    <ReactSelect
                      instanceId="reg-country-select"
                      options={countryOptions}
                      value={currentCountryObj ? { value: currentCountryObj.isoCode, label: currentCountryObj.name } : { value: "SO", label: "Somalia" }}
                      onChange={(opt: any) => {
                        if (opt) {
                          setSelectedCountry(opt.label);
                          setSelectedCity(""); 
                        }
                      }}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: 'calc(var(--radius) - 2px)',
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--background)',
                          color: 'var(--foreground)',
                          boxShadow: 'none',
                          '&:hover': { borderColor: 'var(--border)' }
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)',
                          zIndex: 9999
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? 'var(--accent)' : 'transparent',
                          color: state.isFocused ? 'var(--accent-foreground)' : 'var(--foreground)',
                          '&:active': {
                            backgroundColor: 'var(--accent)',
                          }
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'var(--foreground)',
                        }),
                        input: (base) => ({
                          ...base,
                          color: 'var(--foreground)',
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: 'var(--muted-foreground)',
                        })
                      }}
                    />
                  </div>

                  {/* Searchable City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <ReactSelect
                      instanceId="reg-city-select"
                      key={`city-select-${countryIso}`} 
                      options={cityOptions}
                      value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                      onChange={(opt: any) => setSelectedCity(opt?.value || "")}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: 'calc(var(--radius) - 2px)',
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--background)',
                          color: 'var(--foreground)',
                          boxShadow: 'none',
                          '&:hover': { borderColor: 'var(--border)' }
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)',
                          zIndex: 9999
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? 'var(--accent)' : 'transparent',
                          color: state.isFocused ? 'var(--accent-foreground)' : 'var(--foreground)',
                          '&:active': {
                            backgroundColor: 'var(--accent)',
                          }
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'var(--foreground)',
                        }),
                        input: (base) => ({
                          ...base,
                          color: 'var(--foreground)',
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: 'var(--muted-foreground)',
                        })
                      }}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) <span className="text-red-500">*</span></Label>
                    <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
                  </div>

                  {/* Category / Type */}
                  <div className="space-y-2">
                    <Label htmlFor="propertyTypeId">Property Type <span className="text-red-500">*</span></Label>
                    <Select
                      value={propertyTypeId || ""}
                      onValueChange={(val) => setPropertyTypeId(val)}
                    >
                      <SelectTrigger id="propertyTypeId">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={`cat-${cat.id}`} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Owner */}
                  <div className="space-y-2">
                    <Label htmlFor="ownerId">Owner <span className="text-red-500">*</span></Label>
                    <Select
                      value={ownerId || ""}
                      onValueChange={(val) => setOwnerId(val)}
                    >
                      <SelectTrigger id="ownerId">
                        <SelectValue placeholder="Assign an Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {owners.map((user) => (
                          <SelectItem key={`owner-${user.id}`} value={user.id.toString()}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Agent */}
                  <div className="space-y-2">
                    <Label htmlFor="agentId">Agent <span className="text-red-500">*</span></Label>
                    <Select
                      value={agentId || ""}
                      onValueChange={(val) => setAgentId(val)}
                    >
                      <SelectTrigger id="agentId">
                        <SelectValue placeholder="Assign an Agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((user) => (
                          <SelectItem key={`agent-${user.id}`} value={user.id.toString()}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="listingType">Listing Type <span className="text-red-500">*</span></Label>
                    <Select
                      value={listingType || "RENT"}
                      onValueChange={(val) => setListingType(val)}
                    >
                      <SelectTrigger id="listingType">
                        <SelectValue placeholder="Select Listing Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RENT">RENT</SelectItem>
                        <SelectItem value="SALE">SALE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size Label */}
                  <div className="space-y-2">
                    <Label htmlFor="sizeLabel">Size Label (e.g. 20x30)</Label>
                    <Input id="sizeLabel" value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} placeholder="Dimensions" />
                  </div>

                  {/* Area */}
                  <div className="space-y-2">
                    <Label htmlFor="area">Numerical Area (sq ft/m)</Label>
                    <Input id="area" type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 600" />
                  </div>

                  {/* Rooms */}
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Rooms</Label>
                    <Input id="rooms" type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="0" />
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="0" />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Current Status <span className="text-red-500">*</span></Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                        <SelectItem value="BOOKED">BOOKED</SelectItem>
                        <SelectItem value="RENTED">RENTED</SelectItem>
                        <SelectItem value="SOLD">SOLD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reservation Fee */}
                  <div className="space-y-2">
                    <Label htmlFor="reservationFee">Reservation Fee ($)</Label>
                    <Input id="reservationFee" type="number" step="0.01" value={reservationFee} onChange={(e) => setReservationFee(e.target.value)} placeholder="0.01" />
                  </div>

                  {/* Features */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="features">Property Features</Label>
                    <Input
                      id="features"
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      placeholder="e.g. Swimming Pool, Garage, Free Wi-Fi (comma separated)"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Detailed Description</Label>
                    <textarea
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Describe the property highlights, rules, and benefits."
                    />
                  </div>

                  {/* Image Upload array */}
                  <div className="space-y-2 md:col-span-2 p-4 border rounded-md bg-muted/20">
                    <Label htmlFor="images" className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <ImageIcon className="h-4 w-4" /> Media Upload (max 10)
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer file:cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {currentProperty?.images && currentProperty.images.length > 0
                        ? `This property currently has ${currentProperty.images.length} image(s). Uploading new ones will replace them.`
                        : "Select one or multiple images to attach to this listing."}
                    </p>
                  </div>

                  <DialogFooter className="md:col-span-2 mt-4">
                    <Button type="submit" className="btn-category w-full md:w-auto">
                      {currentProperty ? "Update Listing" : "Publish Property"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
              <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Property Highlights</DialogTitle>
                </DialogHeader>
                {viewProperty && (
                  <div className="space-y-6 py-4">
                    {/* Horizontal Image Gallery */}
                    {viewProperty.images && viewProperty.images.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                        {viewProperty.images.map((img) => {
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://property-management-system-production-e024.up.railway.app/api";
                          const baseUrl = apiUrl.replace("/api", "");
                          const finalUrl = img.url.startsWith('http')
                            ? img.url
                            : `${baseUrl}/${img.url.replace(/\\/g, '/').replace(/^\//, '')}`;

                          return (
                            <img
                              key={img.id}
                              src={finalUrl}
                              alt={viewProperty.title}
                              className="h-48 w-auto min-w-[200px] object-cover rounded-md border shadow-sm snap-center"
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-40 w-full flex items-center justify-center bg-muted rounded-md text-muted-foreground border border-dashed">
                        <ImageIcon className="h-8 w-8 opacity-50 mr-2" /> No media attached
                      </div>
                    )}

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div className="col-span-1 md:col-span-2">
                        <span className="font-semibold text-muted-foreground block mb-1">Name</span>
                        <p className="font-medium text-lg leading-tight">{viewProperty.title}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Price</span>
                        <p className="font-bold text-[#166534] dark:text-[#6ee7b7] text-lg">${viewProperty.price.toLocaleString()}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">City & Country</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md capitalize">{viewProperty.city}, {viewProperty.country || "Somalia"}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Location / Address</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md">{viewProperty.location}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Category & Type</span>
                        <div className="flex items-center gap-2">
                          <span className="border px-2 py-0.5 rounded text-xs font-semibold uppercase">{viewProperty.propertyType?.name || 'Uncategorized'}</span>
                          <span className="font-bold text-xs uppercase opacity-80">{viewProperty.listingType}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Listing Status</span>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${getStatusBadge(viewProperty.status)}`}>{viewProperty.status}</span>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Owner Contact</span>
                        <div className="bg-muted/30 p-2 rounded-md">
                          <p className="font-medium">{viewProperty.owner?.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{viewProperty.owner?.phone}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Agent Contact</span>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md border border-blue-100 dark:border-blue-800">
                          <p className="font-medium text-blue-800 dark:text-blue-300">{viewProperty.agent?.name || 'Unassigned'}</p>
                          <p className="text-xs text-blue-600/80 dark:text-blue-400 mt-0.5 font-mono">{viewProperty.agent?.phone || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Dimensions & Area</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md">
                          {viewProperty.sizeLabel || "N/A"} ({viewProperty.area ? `${viewProperty.area} units` : "No area specified"})
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Rooms & Bathrooms</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md">
                          {viewProperty.Rooms || 0} Rooms, {viewProperty.Bathrooms || 0} Bathrooms
                        </p>
                      </div>

                      <div className="col-span-1 md:col-span-2 mt-2">
                        <span className="font-semibold text-muted-foreground block mb-2">Features</span>
                        <div className="flex flex-wrap gap-2">
                          {viewProperty.features && viewProperty.features.length > 0 ? (
                            viewProperty.features.map(f => (
                              <span key={f.id} className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-xs font-medium">{f.name}</span>
                            ))
                          ) : <span className="text-muted-foreground italic">No features listed</span>}
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 mt-2">
                        <span className="font-semibold text-muted-foreground block mb-2">Description</span>
                        <div className="bg-muted/20 border p-3 rounded-md text-muted-foreground leading-relaxed">
                          {viewProperty.description || <span className="italic">No description provided for this listing.</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Secure Your Booking</DialogTitle>
                </DialogHeader>
                {bookingProperty && (
                  <form onSubmit={handleBookingSubmit} className="space-y-4 py-4">
                    <div className="bg-muted/30 p-3 rounded-md text-sm mb-4">
                      <p className="font-semibold">{bookingProperty.title}</p>
                      <p className="text-muted-foreground mt-1">Booking Fee: <strong>$100</strong></p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Label htmlFor="b-phone">Wafi Mobile Account <span className="text-red-500">*</span></Label>
                      <Input id="b-phone" type="tel" placeholder="e.g. 25261..." value={wafiPhone} onChange={e => setWafiPhone(e.target.value)} required />
                    </div>

                    <DialogFooter className="mt-6">
                      <Button type="submit" className="w-full btn-category bg-[#16a34a] hover:bg-[#15803d] text-white">
                        Confirm & Pay $100 via WaafiPay
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <DataTable
            columns={columns}
            data={properties}
            isLoading={isLoading}
            filterColumn="title"
            filterPlaceholder="Search properties by title..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
