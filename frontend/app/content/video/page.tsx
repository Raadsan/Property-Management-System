"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, VideoIcon } from "lucide-react"

import { getPropertyTypes, Category } from "@/api/propertyTypeApi"
import { getUsers, User } from "@/api/userApi"
import {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  Video
} from "@/api/videoApi"

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

export default function VedioPage() {
  const [videos, setVideos] = React.useState<Video[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [owners, setOwners] = React.useState<User[]>([])
  const [agents, setAgents] = React.useState<User[]>([])

  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentVideo, setCurrentVideo] = React.useState<Video | null>(null)

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false)
  const [viewVideo, setViewVideo] = React.useState<Video | null>(null)

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

  // Location Data
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
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Get the logged in user from session to check role
      const userStr = sessionStorage.getItem("user")
      const loggedInUser = userStr ? JSON.parse(userStr) : null
      const isAgent = loggedInUser?.role?.name?.toLowerCase() === "agent"

      const [vidsData, catsData, usersData] = await Promise.all([
        getVideos(isAgent && loggedInUser ? { agentId: loggedInUser.id } : {}),
        getPropertyTypes(),
        getUsers()
      ])
      setVideos(vidsData)
      setCategories(catsData)

      const ownersOnly = usersData.filter(user => user.role?.name === "Owner" || user.roleId === 2)
      setOwners(ownersOnly)

      let agentsList = usersData.filter(user => user.role?.name === "Agent" || user.roleId === 4)
      
      // 🛡️ Filter Logic: If the user is an agent, they only see themselves
      if (isAgent && loggedInUser) {
        agentsList = agentsList.filter(u => u.id === loggedInUser.id)
        
        // Auto-select the agent if creating a new video
        if (!currentVideo && agentsList.length > 0) {
          setAgentId(agentsList[0].id.toString())
        }
      }

      setAgents(agentsList)
    } catch (error) {
      toast.error("Failed to load video data")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !location || !selectedCity || !price || !ownerId || !propertyTypeId) {
      return toast.error("Please fill in all required fields.")
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

      if (selectedFile) {
        formData.append("video", selectedFile)
      }

      if (currentVideo) {
        await updateVideo(currentVideo.id, formData)
        toast.success("Video updated successfully")
      } else {
        if (!selectedFile) return toast.error("Please select a video file.")
        await createVideo(formData)
        toast.success("Video uploaded successfully")
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
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      await deleteVideo(id)
      toast.success("Video deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete video")
    }
  }

  const openEditModal = (vid: Video) => {
    setCurrentVideo(vid)
    setTitle(vid.title)
    setDescription(vid.description || "")
    setLocation(vid.location)
    setSelectedCity(vid.city)
    setSelectedCountry(vid.country || "Somalia")
    setPrice(vid.price.toString())
    setListingType(vid.listingType)
    setStatus(vid.status)
    setOwnerId(vid.ownerId.toString())
    setAgentId(vid.agentId?.toString() || "")
    setPropertyTypeId(vid.propertyTypeId.toString())
    setSizeLabel(vid.sizeLabel || "")
    setArea(vid.area?.toString() || "")
    setRooms(vid.Rooms?.toString() || "")
    setBathrooms(vid.Bathrooms?.toString() || "")
    setReservationFee(vid.ReservationFee?.toString() || "0.01")
    
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    // Check if current user is an agent to preserve ID
    const userStr = sessionStorage.getItem("user")
    const loggedInUser = userStr ? JSON.parse(userStr) : null
    const isAgent = loggedInUser?.role?.name?.toLowerCase() === "agent"

    setCurrentVideo(null)
    setTitle("")
    setDescription("")
    setLocation("")
    setSelectedCity("")
    setSelectedCountry("Somalia")
    setPrice("")
    setStatus("AVAILABLE")
    setPropertyTypeId("")
    setOwnerId("")
    
    // 🛡️ Preserve Agent ID if user is an agent
    if (isAgent && loggedInUser) {
      setAgentId(loggedInUser.id.toString())
    } else {
      setAgentId("")
    }

    setListingType("RENT")
    setSizeLabel("")
    setArea("")
    setRooms("")
    setBathrooms("")
    setReservationFee("0.01")
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openViewModal = (vid: Video) => {
    setViewVideo(vid)
    setIsViewModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    if (status === "AVAILABLE") return "bg-green-100 text-green-800 ring-green-200";
    if (status === "BOOKED") return "bg-amber-100 text-amber-800 ring-amber-200";
    return "bg-gray-100 text-gray-800 ring-gray-200";
  }

  const columns: ColumnDef<Video>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-bold text-sm">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div className="font-bold text-green-700">${Number(row.getValue("price")).toLocaleString()}</div>,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="text-xs">
          <div>{row.getValue("location")}</div>
          <div className="text-muted-foreground">{row.original.city}, {row.original.country}</div>
        </div>
      ),
    },
    {
      accessorKey: "owner.name",
      header: "Owner",
      cell: ({ row }) => <div className="text-xs font-medium">{row.original.owner?.name}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${getStatusBadge(row.getValue("status") as string)}`}>
          {row.getValue("status")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openViewModal(row.original)} className="text-emerald-600 h-8 w-8">
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEditModal(row.original)} className="text-blue-600 h-8 w-8">
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original.id)} className="text-red-600 h-8 w-8">
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
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video Inventory</h1>
              <p className="text-muted-foreground">Manage property videos and listings.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-700">
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{currentVideo ? "Edit Video" : "Upload New Video"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <ReactSelect
                      options={countryOptions}
                      value={currentCountryObj ? { value: currentCountryObj.isoCode, label: currentCountryObj.name } : { value: "SO", label: "Somalia" }}
                      onChange={(opt: any) => setSelectedCountry(opt.label)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <ReactSelect
                      options={cityOptions}
                      value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                      onChange={(opt: any) => setSelectedCity(opt?.value || "")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($) *</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type *</Label>
                    <Select value={propertyTypeId} onValueChange={setPropertyTypeId}>
                      <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Owner *</Label>
                    <Select value={ownerId} onValueChange={setOwnerId}>
                      <SelectTrigger><SelectValue placeholder="Select Owner" /></SelectTrigger>
                      <SelectContent>
                        {owners.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Agent</Label>
                    <Select value={agentId} onValueChange={setAgentId}>
                      <SelectTrigger><SelectValue placeholder="Select Agent" /></SelectTrigger>
                      <SelectContent>
                        {agents.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rooms</Label>
                    <Input type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Listing Type</Label>
                    <Select value={listingType} onValueChange={setListingType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RENT">RENT</SelectItem>
                        <SelectItem value="SALE">SALE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Video File *</Label>
                    <Input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md p-2 h-20" />
                  </div>
                  <DialogFooter className="md:col-span-2">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {currentVideo ? "Update Video" : "Upload Video"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><VideoIcon className="animate-bounce h-10 w-10 text-muted-foreground" /></div>
          ) : (
            <DataTable columns={columns} data={videos} />
          )}
        </div>

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{viewVideo?.title}</DialogTitle>
            </DialogHeader>
            {viewVideo && (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video src={viewVideo.videoUrl.startsWith('http') ? viewVideo.videoUrl : `http://localhost:8002/${viewVideo.videoUrl}`} controls className="w-full h-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Price:</strong> ${viewVideo.price}</div>
                  <div><strong>Location:</strong> {viewVideo.city}, {viewVideo.country}</div>
                  <div><strong>Type:</strong> {viewVideo.propertyType?.name}</div>
                  <div><strong>Status:</strong> {viewVideo.status}</div>
                </div>
                <p className="text-sm text-muted-foreground">{viewVideo.description}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
