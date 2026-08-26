"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, ImageIcon, HomeIcon, EyeIcon, ShieldCheckIcon, VideoIcon, MessageSquare, XIcon } from "lucide-react"
import { MAX_PROPERTY_MEDIA, isVideoMedia, resolveMediaUrl, sortMediaVideosFirst } from "@/lib/mediaUtils"
import { usePagePermissions } from "@/hooks/usePagePermissions"
import { getUser } from "@/lib/authSession"

import { getPropertyTypes, Category } from "@/api/propertyTypeApi"
import { getUsersByRole, User } from "@/api/userApi"
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  bookProperty,
  updatePropertyStatus,
  Property,
  PropertyImage
} from "@/api/propertyApi"


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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ROOM_BATH_OPTIONS = ["1", "2", "3", "4", "5", "6"] as const
const PROPERTY_FORM_TABS = ["basic", "specs", "amenities", "media"] as const
type PropertyFormTab = (typeof PROPERTY_FORM_TABS)[number]

const toCountSelectValue = (count?: number) => {
  if (!count || count === 0) return ""
  if (count >= 6) return "6"
  return count.toString()
}

const formatCountLabel = (count?: number) => {
  if (!count || count === 0) return "0"
  if (count >= 6) return "6+"
  return count.toString()
}

const AMENITY_OPTIONS = [
  "Furnished",
  "CCTV",
  "Elevator",
  "Ceiling Fan",
  "Gym",
  "Garden",
  "View of Water",
  "Laundry Room",
  "Water Tank",
  "Security",
  "Parking",
  "Air Conditioning",
  "Jacuzzi",
  "Swimming Pool",
  "Balcony",
  "Modern Kitchen",
  "Solar System",
  "Water Heater",
  "Hot Water",
  "Internet Access",
  "Refrigerator",
  "Breakfast Included",
  "Restaurant",
  "Daily Cleaning",
  "Meeting Room",
  "School Nearby",
  "Wi-Fi",
  "Television",
  "Mini Bar",
  "Shared Kitchen",
  "City View",
  "Private Bathroom",
  "Mosque Nearby",
] as const

import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useLocations } from "@/hooks/useLocations"

const PROPERTY_LOCATION_MENU_HEIGHT = 220

const propertyLocationSelectStyles = {
  control: (base: Record<string, unknown>, state?: { isDisabled?: boolean }) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "calc(var(--radius) - 2px)",
    borderColor: "var(--border)",
    backgroundColor: state?.isDisabled ? "rgba(var(--muted), 0.1)" : "var(--background)",
    color: "var(--foreground)",
    opacity: state?.isDisabled ? 0.65 : 1,
    boxShadow: "none",
    "&:hover": { borderColor: "var(--border)" },
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "calc(var(--radius) - 2px)",
    color: "var(--foreground)",
    zIndex: 9999,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    maxHeight: `${PROPERTY_LOCATION_MENU_HEIGHT}px`,
    padding: "4px",
  }),
  menuPortal: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 9999,
    pointerEvents: "auto" as const,
  }),
  option: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    borderRadius: "calc(var(--radius) - 4px)",
    fontSize: "14px",
    padding: "8px 12px",
    backgroundColor: state.isFocused ? "var(--accent)" : "transparent",
    color: state.isFocused ? "var(--accent-foreground)" : "var(--foreground)",
    "&:active": {
      backgroundColor: "var(--accent)",
    },
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--foreground)",
    fontSize: "14px",
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--foreground)",
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--muted-foreground)",
    fontSize: "14px",
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: "2px 8px",
  }),
  indicatorsContainer: (base: Record<string, unknown>) => ({
    ...base,
    height: "40px",
  }),
}

export default function PropertiesPage() {
  const { cityOptions, defaultCity, getDistrictOptions, cityHasDistricts, cityNames } = useLocations()
  const permissions = usePagePermissions("/content/properties")
  const loggedInUser = getUser<{ id?: number; role?: { name?: string } }>()
  const currentUserId = loggedInUser?.id
  const currentRole = loggedInUser?.role?.name?.toUpperCase() ?? ""
  const [properties, setProperties] = React.useState<Property[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [owners, setOwners] = React.useState<User[]>([])
  const [agents, setAgents] = React.useState<User[]>([])

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [advancingId, setAdvancingId] = React.useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentProperty, setCurrentProperty] = React.useState<Property | null>(null)

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false)
  const [viewProperty, setViewProperty] = React.useState<Property | null>(null)

  // Filtering State
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [filterType, setFilterType] = React.useState<string>("all")
  const [filterListing, setFilterListing] = React.useState<string>("all")
  const [filterCity, setFilterCity] = React.useState<string>("all")
  const [filterDistrict, setFilterDistrict] = React.useState<string>("all")
  const [filterFeature, setFilterFeature] = React.useState<string>("all")
  const [filterRole, setFilterRole] = React.useState<string>("all")

  // Form State
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [latitude, setLatitude] = React.useState("")
  const [longitude, setLongitude] = React.useState("")
  const [selectedCity, setSelectedCity] = React.useState("Mogadishu")
  React.useEffect(() => {
    if (defaultCity) {
      setSelectedCity((prev) => (prev === "Mogadishu" ? defaultCity : prev))
    }
  }, [defaultCity])

  const [price, setPrice] = React.useState("")
  const [propertyTypeId, setPropertyTypeId] = React.useState<string>("")
  const [ownerId, setOwnerId] = React.useState<string>("")
  const [agentId, setAgentId] = React.useState<string>("")
  const [listingType, setListingType] = React.useState<string>("RENT")
  const [sizeLabel, setSizeLabel] = React.useState("")
  const [area, setArea] = React.useState("")
  const [rooms, setRooms] = React.useState("")
  const [bathrooms, setBathrooms] = React.useState("")
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([])
  const [features, setFeatures] = React.useState(false)
  const [internalMessage, setInternalMessage] = React.useState("")
  const [selectedDistrict, setSelectedDistrict] = React.useState("")
  const [addressDetails, setAddressDetails] = React.useState("")
  const [activePropertyTab, setActivePropertyTab] = React.useState<PropertyFormTab>("basic")

  // File State
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [existingMedia, setExistingMedia] = React.useState<PropertyImage[]>([])

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false)
  const [bookingProperty, setBookingProperty] = React.useState<Property | null>(null)
  const [wafiPhone, setWafiPhone] = React.useState("")

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      // Get the logged in user from session to check role
      const loggedInUser = getUser<{ id?: number; role?: { name?: string } }>()
      const isAdmin = loggedInUser?.role?.name?.toLowerCase() === "admin"
      const isAgent = loggedInUser?.role?.name?.toLowerCase() === "agent"

      const [propsData, catsData, ownersData, agentsData] = await Promise.all([
        getProperties({ mine: true }),
        getPropertyTypes(),
        getUsersByRole("Owner"),
        getUsersByRole("Agent"),
      ])
      setProperties(propsData)
      setCategories(catsData)
      setOwners(ownersData)

      let agentsList = agentsData

      if (isAgent && loggedInUser) {
        agentsList = agentsList.filter(u => u.id === loggedInUser.id)

        if (!currentProperty && agentsList.length > 0) {
          setAgentId(agentsList[0].id.toString())
        }
      }

      setAgents(agentsList)
    } catch (error) {
      toast.error("Failed to load property data")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).sort((a, b) => {
        const aVideo = isVideoMedia(a) ? 0 : 1;
        const bVideo = isVideoMedia(b) ? 0 : 1;
        return aVideo - bVideo;
      });
      if (files.length + existingMedia.length > MAX_PROPERTY_MEDIA) {
        toast.error(`You can upload up to ${MAX_PROPERTY_MEDIA} files (images and videos).`)
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }
      setSelectedFiles(files)
    }
  }

  const removeSelectedFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => {
      const nextFiles = prev.filter((_, index) => index !== indexToRemove)
      if (nextFiles.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return nextFiles
    })
  }

  const goToNextPropertyTab = () => {
    const currentIndex = PROPERTY_FORM_TABS.indexOf(activePropertyTab)
    if (currentIndex < PROPERTY_FORM_TABS.length - 1) {
      setActivePropertyTab(PROPERTY_FORM_TABS[currentIndex + 1])
    }
  }

  const goToPreviousPropertyTab = () => {
    const currentIndex = PROPERTY_FORM_TABS.indexOf(activePropertyTab)
    if (currentIndex > 0) {
      setActivePropertyTab(PROPERTY_FORM_TABS[currentIndex - 1])
    }
  }

  const handleSubmit = async () => {

    const missingFields: string[] = []

    if (!title.trim()) missingFields.push("Title")
    if (!selectedCity.trim()) missingFields.push("City")
    if (!price.trim()) missingFields.push("Price")
    if (!propertyTypeId.trim()) missingFields.push("Property Type")
    if (!agentId.trim()) missingFields.push("Agent")

    const cityNeedsDistrict = cityHasDistricts(selectedCity)
    if (cityNeedsDistrict && !selectedDistrict.trim()) {
      missingFields.push("District / Degmo")
    }

    if (missingFields.length > 0) {
      const firstMissing = missingFields[0]
      if (["Title", "City", "Property Type", "Agent", "District / Degmo"].includes(firstMissing)) {
        setActivePropertyTab("basic")
      } else if (["Price"].includes(firstMissing)) {
        setActivePropertyTab("specs")
      }

      return toast.error(`Please fill in: ${missingFields.join(", ")}`)
    }

    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("location", location.trim())
      formData.append("latitude", latitude.trim())
      formData.append("longitude", longitude.trim())
      formData.append("city", selectedCity)
      formData.append("district", cityHasDistricts(selectedCity) ? selectedDistrict : "")
      formData.append("country", "Somalia")
      formData.append("price", price)
      formData.append("listingType", listingType)
      if (ownerId) formData.append("ownerId", ownerId)
      if (agentId) formData.append("agentId", agentId)
      formData.append("propertyTypeId", propertyTypeId)
      if (sizeLabel) formData.append("sizeLabel", sizeLabel)
      if (area) formData.append("area", area)
      if (rooms) formData.append("Rooms", rooms)
      if (bathrooms) formData.append("Bathrooms", bathrooms)

      formData.append("features", features ? "true" : "false")
      formData.append("internalMessage", internalMessage)

      if (selectedAmenities.length > 0) {
        formData.append("amenities", JSON.stringify(selectedAmenities))
      }

      // Append images
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("images", file)
        })
      }

      if (currentProperty) {
        formData.append("retainedImageIds", JSON.stringify(existingMedia.map((media) => media.id)))
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
      await loadData(true)
    } catch (error: any) {
      const data = error.response?.data
      const errMsg =
        data?.message ||
        (typeof data === "string" ? data : null) ||
        error.message ||
        "An error occurred while saving"
      toast.error(errMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this property? This action is permanent!")) return

    try {
      setDeletingId(id)
      await deleteProperty(id)
      toast.success("Property deleted successfully")
      await loadData(true)
    } catch (error) {
      toast.error("Failed to delete property")
    } finally {
      setDeletingId(null)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingProperty || !wafiPhone) {
      return toast.error("Please provide a Wafi Merchant Phone Number.")
    }

    try {
      const loggedInUser = getUser<{ id?: number; role?: { name?: string } }>()
      if (!loggedInUser) {
        toast.error("You must be logged in to book.")
        return
      }
      const userId = loggedInUser.id ?? (loggedInUser as { userId?: number }).userId
      if (!userId) {
        toast.error("You must be logged in to book.")
        return
      }

      await bookProperty(bookingProperty.id, {
        userId,
        phone: wafiPhone
      })

      toast.success("Payment successful via Wafi! Property is secured.")
      setIsBookingModalOpen(false)
      await loadData(true) // Refresh status to BOOKED
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

  const handleStatusChange = async (property: Property) => {
    const nextStatus = property.status === "AVAILABLE" ? "BOOKED" : "AVAILABLE"
    if (!confirm(`Change this property status from ${property.status} to ${nextStatus}?`)) return
    try {
      setAdvancingId(property.id)
      await updatePropertyStatus(property.id, nextStatus)
      toast.success(`Property status changed to ${nextStatus}`)
      await loadData(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change property status")
    } finally {
      setAdvancingId(null)
    }
  }

  const openEditModal = (prop: Property) => {
    setActivePropertyTab("basic")
    if (prop) {
      setCurrentProperty(prop)
      setTitle(prop.title)
      setDescription(prop.description || "")
      setLocation(prop.location || "")
      setLatitude(prop.latitude != null ? String(prop.latitude) : "")
      setLongitude(prop.longitude != null ? String(prop.longitude) : "")
      setSelectedCity(prop.city)
      setSelectedDistrict(prop.district || "")
      setPrice(prop.price.toString())
      setListingType(prop.listingType)
      setOwnerId(prop.ownerId?.toString() || "")
      setAgentId(prop.agentId?.toString() || "")
      setPropertyTypeId(prop.propertyTypeId.toString())
      setSizeLabel(prop.sizeLabel || "")
      setArea(prop.area?.toString() || "")
      setRooms(toCountSelectValue(prop.Rooms))
      setBathrooms(toCountSelectValue(prop.Bathrooms))
      setSelectedAmenities(prop.amenities?.map(f => f.name) || [])
      setFeatures(prop.features ?? false)
      setInternalMessage(prop.internalMessage || "")
      setExistingMedia(sortMediaVideosFirst(prop.images || []))
    } else {
      setCurrentProperty(null)
      setTitle("")
      setDescription("")
      setLocation("")
      setLatitude("")
      setLongitude("")
      setSelectedCity(defaultCity || "Mogadishu")
      setPrice("")
      setListingType("RENT")
      setOwnerId("")
      setAgentId("")
      setPropertyTypeId("")
      setSizeLabel("")
      setArea("")
      setRooms("")
      setBathrooms("")
      setSelectedAmenities([])
      setFeatures(false)
      setInternalMessage("")
      setExistingMedia([])
    }

    setSelectedFiles([])
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setActivePropertyTab("basic")
    setIsModalOpen(true)
  }

  const resetForm = () => {
    // Check if the current user is an agent to preserve their ID
    const loggedInUser = getUser<{ id?: number; role?: { name?: string } }>()
    const isAgent = loggedInUser?.role?.name?.toLowerCase() === "agent"

    setCurrentProperty(null)
    setTitle("")
    setDescription("")
    setLocation("")
    setLatitude("")
    setLongitude("")
    setSelectedDistrict("")
    setSelectedCity(defaultCity || "Mogadishu")
    setPrice("")
    setPropertyTypeId("")
    setOwnerId("")

    // 🛡️ Preserve Agent ID if user is an agent
    const agentUserId = loggedInUser?.id
    if (isAgent && agentUserId) {
      setAgentId(agentUserId.toString())
    } else {
      setAgentId("")
    }

    setListingType("RENT")
    setSizeLabel("")
    setArea("")
    setRooms("")
    setBathrooms("")
    setSelectedAmenities([])
    setFeatures(false)
    setInternalMessage("")
    setSelectedFiles([])
    setExistingMedia([])
    setActivePropertyTab("basic")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openViewModal = (property: Property) => {
    setViewProperty(property)
    setIsViewModalOpen(true)
  }

  // Filtered Data
  const filteredProperties = React.useMemo(() => {
    return properties.filter(prop => {
      const matchStatus = filterStatus === "all" || prop.status === filterStatus
      const matchType = filterType === "all" || prop.propertyTypeId.toString() === filterType
      const matchListing = filterListing === "all" || prop.listingType === filterListing
      const matchCity = filterCity === "all" ||
        prop.city === filterCity ||
        (filterCity === "Muqdisho" && prop.city === "Mogadishu") ||
        (filterCity === "Mogadishu" && prop.city === "Muqdisho")
      const matchDistrict = filterDistrict === "all" || prop.district === filterDistrict
      const matchFeature =
        filterFeature === "all" ||
        (filterFeature === "featured" && prop.features === true) ||
        (filterFeature === "not-featured" && !prop.features)
      const propertyRole = prop.createdBy?.role?.name || prop.owner?.role?.name || prop.agent?.role?.name || "Unknown"
      const matchRole = filterRole === "all" || propertyRole === filterRole
      return matchStatus && matchType && matchListing && matchCity && matchDistrict && matchFeature && matchRole
    })
  }, [properties, filterStatus, filterType, filterListing, filterCity, filterDistrict, filterFeature, filterRole])

  const rolesList = React.useMemo(() => {
    return Array.from(new Set(properties.map(prop =>
      prop.createdBy?.role?.name || prop.owner?.role?.name || prop.agent?.role?.name || "Unknown"
    ))).sort()
  }, [properties])

  const citiesList = React.useMemo(() => {
    const fromApi = cityNames
    const fromDb = properties.map(p => p.city === "Muqdisho" ? "Mogadishu" : p.city).filter(Boolean)
    return Array.from(new Set([...fromApi, ...fromDb]))
  }, [properties, cityNames])


  const districtsList = React.useMemo(() => {
    if (filterCity === "all") {
      // Get all unique districts from properties
      const unique = new Set(properties.map(p => p.district).filter(Boolean))
      return Array.from(unique)
    }
    // Get districts for this specific city
    // Convert Mogadishu/Muqdisho compatibility
    const targetCity = (filterCity === "Muqdisho" || filterCity === "Mogadishu") ? "Mogadishu" : filterCity;
    const preDefined = getDistrictOptions(targetCity).map(d => d.value)

    // Also include any other custom districts saved in database for this city
    const savedInDb = properties
      .filter(p => p.city === filterCity || (targetCity === "Mogadishu" && (p.city === "Mogadishu" || p.city === "Muqdisho")))
      .map(p => p.district)
      .filter(Boolean)

    const combined = new Set([...preDefined, ...savedInDb])
    return Array.from(combined)
  }, [properties, filterCity])

  // Determine badge styling based on Status
  const getStatusBadge = (status: string) => {
    if (status === "AVAILABLE") return "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0] dark:bg-[#064e3b] dark:text-[#6ee7b7] dark:ring-[#047857]";
    if (status === "CREATED") return "bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:ring-orange-800";
    if (status === "BOOKED") return "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:ring-amber-800";
    if (status === "SOLD") return "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:ring-blue-800";
    if (status === "RENTED") return "bg-purple-100 text-purple-800 ring-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:ring-purple-800";
    return "bg-gray-100 text-gray-800 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700";
  }

  const getStatusAction = (property: Property) => {
    if (!permissions.canApprove) return null
    const isAdminRole = currentRole === "ADMIN" || currentRole === "SUPER_ADMIN"
    const isInScope =
      isAdminRole ||
      (currentRole === "OWNER" && property.ownerId === currentUserId) ||
      (currentRole === "AGENT" && property.agentId === currentUserId)
    if (property.status === "CREATED") {
      return isAdminRole ? { label: "Make Available" } : null
    }
    if (!isInScope) return null
    if (property.status === "AVAILABLE") return { label: "Mark Booked" }
    if (property.status === "BOOKED") return { label: "Mark Available" }
    return null
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
      accessorKey: "listingType",
      header: "Listing",
      cell: ({ row }) => (
        <div className="text-xs uppercase font-bold tracking-wider opacity-80">
          {row.getValue("listingType")}
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="text-sm font-semibold opacity-85">
          {row.original.city}
        </span>
      ),
    },
    {
      accessorKey: "district",
      header: "District",
      cell: ({ row }) => (
        <span className="text-sm font-semibold opacity-85">
          {row.original.district || "-"}
        </span>
      ),
    },
    {
      accessorKey: "location",
      header: "Area",
      cell: ({ row }) => {
        const area = row.getValue("location") as string
        return (
          <span className="text-sm font-semibold opacity-85">
            {area || ""}
          </span>
        )
      },
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
      cell: ({ row }) => {
        const statusAction = getStatusAction(row.original)
        return (
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
          {statusAction && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(row.original)}
              disabled={advancingId === row.original.id}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 h-8 w-8"
              title={statusAction.label}
            >
              {advancingId === row.original.id
                ? <Loader2Icon className="h-4 w-4 animate-spin" />
                : <ShieldCheckIcon className="h-4 w-4" />}
            </Button>
          )}
          {permissions.canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditModal(row.original)}
              disabled={isSaving || deletingId !== null}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
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
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
            >
              {deletingId === row.original.id ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )},
    },
  ]

  return (
<div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Properties Inventory</h1>
              <p className="text-muted-foreground">Manage your real estate listings, pricing, and media.</p>
            </div>
            {permissions.canAdd && (
              <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open && isSaving) return;
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
                  className="sm:max-w-[1050px] w-[95vw] max-h-[92vh] overflow-y-auto"
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
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                    }}
                    className="py-4"
                  >
                    <Tabs value={activePropertyTab} onValueChange={(value) => setActivePropertyTab(value as PropertyFormTab)} className="gap-4">
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="specs">Pricing & Specs</TabsTrigger>
                        <TabsTrigger value="amenities">Amenities</TabsTrigger>
                        <TabsTrigger value="media">Media & Notes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="title"> Title <span className="text-red-500">*</span></Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Luxurious Downtown Apartment" required />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                            <ReactSelect
                              instanceId="reg-city-select"
                              options={cityOptions}
                              value={selectedCity ? { value: selectedCity, label: selectedCity } : (defaultCity ? { value: defaultCity, label: defaultCity } : null)}
                              onChange={(opt: any) => {
                                setSelectedCity(opt?.value || "");
                                setSelectedDistrict("");
                              }}
                              placeholder="Select City..."
                              isSearchable
                              maxMenuHeight={PROPERTY_LOCATION_MENU_HEIGHT}
                              menuPlacement="auto"
                              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                              classNamePrefix="react-select"
                              styles={propertyLocationSelectStyles}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="district">District / Degmo {cityHasDistricts(selectedCity) && <span className="text-red-500">*</span>}</Label>
                            <ReactSelect
                              instanceId="reg-district-select"
                              options={getDistrictOptions(selectedCity)}
                              value={selectedDistrict ? { value: selectedDistrict, label: selectedDistrict } : null}
                              onChange={(opt: any) => setSelectedDistrict(opt?.value || "")}
                              isDisabled={!cityHasDistricts(selectedCity)}
                              placeholder={cityHasDistricts(selectedCity) ? "Select District..." : "No districts for this city"}
                              isSearchable
                              isClearable
                              maxMenuHeight={PROPERTY_LOCATION_MENU_HEIGHT}
                              menuPlacement="auto"
                              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                              classNamePrefix="react-select"
                              styles={propertyLocationSelectStyles}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Area</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Neighborhood or street" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                              id="latitude"
                              type="number"
                              step="any"
                              value={latitude}
                              onChange={(e) => setLatitude(e.target.value)}
                              placeholder="0.00000000"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                              id="longitude"
                              type="number"
                              step="any"
                              value={longitude}
                              onChange={(e) => setLongitude(e.target.value)}
                              placeholder="0.00000000"
                            />
                          </div>

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

                          <div className="space-y-2">
                            <Label htmlFor="ownerId">Owner</Label>
                            <Select
                              value={ownerId || ""}
                              onValueChange={(val) => setOwnerId(val)}
                            >
                              <SelectTrigger id="ownerId">
                                <SelectValue placeholder="Assign an Owner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None / Unassigned</SelectItem>
                                {owners.map((user) => (
                                  <SelectItem key={`owner-${user.id}`} value={user.id.toString()}>{user.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

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
                                {agents.map((agent) => (
                                  <SelectItem key={`agent-${agent.id}`} value={agent.id.toString()}>{agent.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="specs" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price ($) <span className="text-red-500">*</span></Label>
                            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
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
                                <SelectItem value="RENT">Rent</SelectItem>
                                <SelectItem value="SALE">Buy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sizeLabel">Size Label (e.g. 20x30)</Label>
                            <Input id="sizeLabel" value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} placeholder="Dimensions" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="area">Numerical Area (sq ft/m)</Label>
                            <Input id="area" type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 600" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="rooms">Rooms</Label>
                            <Select value={rooms || undefined} onValueChange={setRooms}>
                              <SelectTrigger id="rooms">
                                <SelectValue placeholder="Select rooms" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROOM_BATH_OPTIONS.map((n) => (
                                  <SelectItem key={`rooms-${n}`} value={n}>
                                    {n === "6" ? "6+" : n}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bathrooms">Bathrooms</Label>
                            <Select value={bathrooms || undefined} onValueChange={setBathrooms}>
                              <SelectTrigger id="bathrooms">
                                <SelectValue placeholder="Select bathrooms" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROOM_BATH_OPTIONS.map((n) => (
                                  <SelectItem key={`baths-${n}`} value={n}>
                                    {n === "6" ? "6+" : n}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center gap-3 rounded-md border border-input bg-muted/10 px-4 py-3">
                              <Checkbox
                                id="features"
                                checked={features}
                                onCheckedChange={(checked) => setFeatures(checked === true)}
                              />
                              <Label htmlFor="features" className="cursor-pointer">
                                Mark this property as featured
                              </Label>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="amenities" className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Amenities</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 rounded-md border border-input bg-muted/10 p-4">
                            {AMENITY_OPTIONS.map((amenity) => (
                              <div key={amenity} className="flex items-center gap-2.5">
                                <Checkbox
                                  id={`amenity-${amenity}`}
                                  checked={selectedAmenities.includes(amenity)}
                                  onCheckedChange={(checked) => {
                                    setSelectedAmenities((prev) =>
                                      checked === true
                                        ? [...prev, amenity]
                                        : prev.filter((a) => a !== amenity)
                                    )
                                  }}
                                />
                                <Label
                                  htmlFor={`amenity-${amenity}`}
                                  className="text-sm font-normal cursor-pointer leading-tight"
                                >
                                  {amenity}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Detailed Description</Label>
                          <textarea
                            id="description"
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Describe the property highlights, rules, and benefits."
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="media" className="space-y-4">
                        <div className="space-y-2 p-4 border rounded-md bg-muted/20">
                          <Label htmlFor="images" className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <ImageIcon className="h-4 w-4" /> Media Upload (max {MAX_PROPERTY_MEDIA})
                          </Label>
                          <Input
                            id="images"
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="cursor-pointer file:cursor-pointer"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {currentProperty
                              ? `Keep the media you want, remove individual items, or add new files (${existingMedia.length + selectedFiles.length}/${MAX_PROPERTY_MEDIA}).`
                              : "Select images and/or videos (MP4, MOV, WebM). Max 100MB per file."}
                          </p>
                          {(existingMedia.length > 0 || selectedFiles.length > 0) && (
                            <div className="space-y-2 pt-2">
                              {currentProperty && <p className="text-xs font-medium">Current media and new uploads</p>}
                              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
                                {existingMedia.map((media) => (
                                  <div key={media.id} className="relative aspect-square rounded-md border overflow-hidden bg-muted flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => setExistingMedia((prev) => prev.filter((item) => item.id !== media.id))}
                                      className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700"
                                      aria-label="Remove existing media"
                                      title="Remove this media"
                                    >
                                      <XIcon className="h-3.5 w-3.5" />
                                    </button>
                                    {isVideoMedia(media.url) || media.type === "VIDEO" ? (
                                      <video src={resolveMediaUrl(media.url)} className="h-full w-full object-cover" muted />
                                    ) : (
                                      <img src={resolveMediaUrl(media.url)} alt="Property media" className="h-full w-full object-cover" />
                                    )}
                                  </div>
                                ))}
                                {selectedFiles.map((file, idx) => (
                                  <div key={`${file.name}-${idx}`} className="relative aspect-square rounded-md border overflow-hidden bg-muted flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => removeSelectedFile(idx)}
                                      className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                                      aria-label={`Remove ${file.name}`}
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </button>
                                    {isVideoMedia(file) ? (
                                      <>
                                        <VideoIcon className="h-8 w-8 text-muted-foreground" />
                                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] px-1 truncate">{file.name}</span>
                                      </>
                                    ) : (
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 p-4 border rounded-md bg-muted/20">
                          <Label htmlFor="internalMessage" className="flex items-center gap-2 text-sm font-semibold">
                            <MessageSquare className="h-4 w-4" /> Comments / Internal Message
                          </Label>
                          <textarea
                            id="internalMessage"
                            rows={5}
                            value={internalMessage}
                            onChange={(e) => setInternalMessage(e.target.value)}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Add any internal comments or notes about this property. This will only be visible to admin and team members."
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                      <div>
                        {activePropertyTab !== "basic" && (
                          <Button type="button" variant="outline" onClick={goToPreviousPropertyTab} className="w-full sm:w-auto">
                            Previous
                          </Button>
                        )}
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {activePropertyTab !== "media" ? (
                          <Button type="button" onClick={goToNextPropertyTab} className="btn-category w-full sm:w-auto">
                            Next
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="btn-category w-full sm:w-auto"
                          >
                            {isSaving ? (
                              <>
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                {currentProperty ? "Updating..." : "Creating..."}
                              </>
                            ) : (
                              currentProperty ? "Update Listing" : "Create Property"
                            )}
                          </Button>
                        )}
                      </div>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-[1050px] max-h-[92vh] overflow-x-hidden overflow-y-auto p-0 gap-0">
              <DialogHeader className="sticky top-0 z-20 flex-row items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <HomeIcon className="h-5 w-5 text-primary" /> Property Highlights
                </DialogTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsViewModalOpen(false)}
                  className="h-9 w-9 shrink-0 rounded-full"
                  aria-label="Close property details"
                  title="Close"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </DialogHeader>
              {viewProperty && (
                <div className="space-y-6 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">{viewProperty.propertyType?.name || "Property"} for {viewProperty.listingType === "RENT" ? "rent" : "sale"}</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{viewProperty.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{[viewProperty.location, viewProperty.district, viewProperty.city].filter(Boolean).join(", ")}</p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">${Number(viewProperty.price).toLocaleString()}</p>
                      <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${getStatusBadge(viewProperty.status)}`}>{viewProperty.status}</span>
                    </div>
                  </div>

                  {/* Responsive media gallery */}
                  {viewProperty.images && viewProperty.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {sortMediaVideosFirst(viewProperty.images).map((img) => {
                        const finalUrl = resolveMediaUrl(img.url);
                        const isVideo = img.type === "VIDEO" || isVideoMedia(img.url);

                        return isVideo ? (
                          <video
                            key={img.id}
                            src={finalUrl}
                            controls
                            className="aspect-[4/3] w-full rounded-xl border bg-black object-cover shadow-sm"
                          />
                        ) : (
                          <img
                            key={img.id}
                            src={finalUrl}
                            alt={viewProperty.title}
                            className="aspect-[4/3] w-full rounded-xl border object-cover shadow-sm"
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
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3 [&>div]:min-w-0 [&>div]:rounded-xl [&>div]:border [&>div]:bg-muted/20 [&>div]:p-4">
                    <div className="col-span-1 md:col-span-3 md:hidden">
                      <span className="font-semibold text-muted-foreground block mb-1">Name</span>
                      <p className="font-medium text-lg leading-tight">{viewProperty.title}</p>
                    </div>

                    <div className="md:hidden">
                      <span className="font-semibold text-muted-foreground block mb-1">Price</span>
                      <p className="font-bold text-[#166534] dark:text-[#6ee7b7] text-lg">${viewProperty.price.toLocaleString()}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">City</span>
                      <p className="font-medium bg-muted/40 p-2 rounded-md capitalize">{viewProperty.city}</p>
                    </div>

                    {viewProperty.district && (
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">District / Degmo</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md capitalize">{viewProperty.district}</p>
                      </div>
                    )}

                    {viewProperty.location ? (
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Area</span>
                        <p className="font-medium bg-muted/40 p-2 rounded-md">{viewProperty.location}</p>
                      </div>
                    ) : null}

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Latitude</span>
                      <p className="font-medium bg-muted/40 p-2 rounded-md">
                        {viewProperty.latitude != null ? Number(viewProperty.latitude).toFixed(8) : "—"}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Longitude</span>
                      <p className="font-medium bg-muted/40 p-2 rounded-md">
                        {viewProperty.longitude != null ? Number(viewProperty.longitude).toFixed(8) : "—"}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Property Type</span>
                      <span className="inline-flex rounded-md border bg-background px-2.5 py-1 text-xs font-semibold uppercase">
                        {viewProperty.propertyType?.name || 'Uncategorized'}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Listing Type</span>
                      <span className="inline-flex rounded-md border bg-background px-2.5 py-1 text-xs font-bold uppercase">
                        {viewProperty.listingType}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Listing Status</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${getStatusBadge(viewProperty.status)}`}>{viewProperty.status}</span>
                        <span className="inline-flex items-center rounded-md border bg-background px-2 py-1 text-xs font-medium">
                          Featured: {viewProperty.features ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Owner Contact</span>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <p className="font-medium">{viewProperty.owner?.name || 'Unassigned'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{viewProperty.owner?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-1">Agent Contact</span>
                      <div className="bg-transparent py-1">
                        <p className="font-medium text-blue-700 dark:text-blue-400">{viewProperty.agent?.name || 'Unassigned'}</p>
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground font-mono">
                            <span className="font-semibold text-foreground/70">Phone:</span> {viewProperty.agent?.phone || 'N/A'}
                          </p>
                        </div>
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
                        {formatCountLabel(viewProperty.Rooms)} Rooms, {formatCountLabel(viewProperty.Bathrooms)} Bathrooms
                      </p>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                      <span className="font-semibold text-muted-foreground block mb-2">Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {viewProperty.amenities && viewProperty.amenities.length > 0 ? (
                          viewProperty.amenities.map(f => (
                            <span key={f.id} className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-xs font-medium">{f.name}</span>
                          ))
                        ) : <span className="text-muted-foreground italic">No amenities listed</span>}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                      <span className="font-semibold text-muted-foreground block mb-2">Description</span>
                      <div className="bg-muted/20 border p-3 rounded-md text-muted-foreground leading-relaxed">
                        {viewProperty.description || <span className="italic">No description provided for this listing.</span>}
                      </div>
                    </div>

                    {viewProperty.internalMessage && (
                      <div className="col-span-1 md:col-span-3">
                        <span className="font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4" /> Comments / Internal Message
                        </span>
                        <div className="bg-muted/20 border p-3 rounded-md text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {viewProperty.internalMessage}
                        </div>
                      </div>
                    )}
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
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="b-phone">Wafi Mobile Account <span className="text-red-500">*</span></Label>
                    <Input id="b-phone" type="tel" placeholder="e.g. 25261..." value={wafiPhone} onChange={e => setWafiPhone(e.target.value)} required />
                  </div>

                  <DialogFooter className="mt-6">
                    <Button type="submit" className="w-full btn-category bg-[#16a34a] hover:bg-[#15803d] text-white">
                      Confirm & Pay via WaafiPay
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>


          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-6 items-end bg-card p-4 rounded-2xl border border-border/50">
            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Prop Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Listing</Label>
              <Select value={filterListing} onValueChange={setFilterListing}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="SALE">Buy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">City</Label>
              <Select value={filterCity} onValueChange={(val) => { setFilterCity(val); setFilterDistrict("all"); }}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {citiesList.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">District</Label>
              <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districtsList.map(district => (
                    <SelectItem key={district} value={district!}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Feature</Label>
              <Select value={filterFeature} onValueChange={setFilterFeature}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Features" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Features</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="not-featured">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {rolesList.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus("all");
                setFilterType("all");
                setFilterListing("all");
                setFilterCity("all");
                setFilterDistrict("all");
                setFilterFeature("all");
                setFilterRole("all");
              }}
              className="text-xs font-bold text-muted-foreground h-9 hover:bg-muted"
            >
              Reset
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredProperties}
            isLoading={isLoading}
            filterColumn="title"
            filterPlaceholder="Search properties by title..."
          />
        </div>
)
}
