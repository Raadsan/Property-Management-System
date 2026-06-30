"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { getContactMessages, updateContactStatus, updateContactPriority, deleteContact, createContactAdmin } from "@/api/contactApi"
import { toast } from "sonner"
import { format } from "date-fns"
import { CheckCircle2Icon, ClockIcon, RefreshCcwIcon, PhoneIcon, CalendarIcon, ChevronDownIcon, Trash2Icon, AlertCircleIcon, ArrowRightIcon, MessageSquareIcon, UserMinusIcon, FilterIcon, PlusIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Define the Message type based on the response
export type Message = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  inquiryType: string
  message: string
  status: string
  priority: string
  createdAt: string
}

export default function MessagesDashboardPage() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Add Lead Modal State
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "Renting",
    message: "",
    status: "NEW",
    priority: "UNKNOWN"
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.")
      return
    }
    setIsSubmitting(true)
    try {
      const response = await createContactAdmin(formData)
      if (response.status === 'OK') {
        toast.success("Lead created successfully!")
        setIsAddOpen(false)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          inquiryType: "Renting",
          message: "",
          status: "NEW",
          priority: "UNKNOWN"
        })
        fetchMessages()
      } else {
        toast.error(response.message || "Failed to create lead.")
      }
    } catch (error: any) {
      console.error("Create lead error:", error)
      toast.error(error.response?.data?.message || "Failed to create lead.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtering State
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [filterPriority, setFilterPriority] = React.useState<string>("all")
  const [filterType, setFilterType] = React.useState<string>("all")

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const response = await getContactMessages()
      setMessages(response.data || [])
    } catch (error: any) {
      console.error("Fetch messages error:", error)
      toast.error("Network Error: Could not connect to server.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateContactStatus(id, newStatus)
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg))
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      console.error("Update status error:", error)
      toast.error("Failed to update status")
    }
  }

  const handlePriorityChange = async (id: number, newPriority: string) => {
    try {
      await updateContactPriority(id, newPriority)
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, priority: newPriority } : msg))
      toast.success(`Priority set to ${newPriority}`)
    } catch (error) {
      console.error("Update priority error:", error)
      toast.error("Failed to update priority")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return
    try {
      await deleteContact(id)
      setMessages(prev => prev.filter(msg => msg.id !== id))
      toast.success("Inquiry deleted")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete")
    }
  }

  React.useEffect(() => {
    fetchMessages()
  }, [])

  // Filtered Data
  const filteredMessages = React.useMemo(() => {
    return messages.filter(msg => {
      const matchStatus = filterStatus === "all" || msg.status === filterStatus
      const matchPriority = filterPriority === "all" || msg.priority === filterPriority
      const matchType = filterType === "all" || msg.inquiryType === filterType
      return matchStatus && matchPriority && matchType
    })
  }, [messages, filterStatus, filterPriority, filterType])

  const inquiryTypes = React.useMemo(() => {
    const types = new Set(messages.map(m => m.inquiryType).filter(Boolean))
    return Array.from(types)
  }, [messages])

  // Column definitions for DataTable
  const columns: ColumnDef<Message>[] = [
    {
      accessorKey: "sender",
      header: "Sender",
      cell: ({ row }) => {
        const msg = row.original
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-foreground text-[15px]">{msg.firstName} {msg.lastName}</span>
            <span className="text-[13px] text-muted-foreground font-medium">{msg.email}</span>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
              <PhoneIcon className="w-3 h-3" />
              {msg.phone || 'N/A'}
            </div>
          </div>
        )
      },
      // Filtering will work on email by default if we use this accessorKey
      filterFn: (row, id, value) => {
        const name = `${row.original.firstName} ${row.original.lastName}`.toLowerCase()
        return name.includes(value.toLowerCase()) || row.original.email.toLowerCase().includes(value.toLowerCase())
      }
    },
    {
      accessorKey: "inquiryType",
      header: "Inquiry Type",
      cell: ({ row }) => {
        const type = row.getValue("inquiryType") as string
        return (
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border ${type === 'Support' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
              type === 'Renting' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                type === 'Buying' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                  'bg-muted text-muted-foreground border-border'
            }`}>
            {type}
          </span>
        )
      }
    },
    {
      accessorKey: "message",
      header: "Message Content",
      cell: ({ row }) => (
        <p className="text-muted-foreground text-[14px] leading-relaxed line-clamp-2 max-w-sm hover:line-clamp-none transition-all duration-300 cursor-default">
          {row.getValue("message")}
        </p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date Received",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[12px]">
              <CalendarIcon className="w-3.5 h-3.5" />
              {format(date, 'MMM dd, yyyy')}
            </div>
            <span className="text-[11px] text-muted-foreground/50 font-medium">
              at {format(date, 'HH:mm')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const id = row.original.id

        const getStatusStyles = (st: string) => {
          switch (st) {
            case 'CONVERTED': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            case 'LOST': return 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
            case 'FOLLOW_UP': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
            case 'IN_PROGRESS': return 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
            case 'NEW': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
            default: return 'bg-muted text-muted-foreground hover:bg-muted/80'
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all duration-300 outline-hidden ${getStatusStyles(status)}`}
              >
                {status === 'CONVERTED' ? <CheckCircle2Icon className="w-3.5 h-3.5" /> : <ClockIcon className="w-3.5 h-3.5" />}
                {status.replace('_', ' ').toLowerCase()}
                <ChevronDownIcon className="w-3 h-3 ml-0.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem onClick={() => handleStatusChange(id, 'NEW')} className="flex items-center gap-2 font-bold text-xs uppercase text-amber-500">
                <MessageSquareIcon className="w-3.5 h-3.5" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(id, 'FOLLOW_UP')} className="flex items-center gap-2 font-bold text-xs uppercase text-blue-500">
                <RefreshCcwIcon className="w-3.5 h-3.5" />
                Follow Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(id, 'IN_PROGRESS')} className="flex items-center gap-2 font-bold text-xs uppercase text-indigo-500">
                <ArrowRightIcon className="w-3.5 h-3.5" />
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(id, 'CONVERTED')} className="flex items-center gap-2 font-bold text-xs uppercase text-green-500">
                <CheckCircle2Icon className="w-3.5 h-3.5" />
                Converted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(id, 'LOST')} className="flex items-center gap-2 font-bold text-xs uppercase text-rose-500">
                <UserMinusIcon className="w-3.5 h-3.5" />
                Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        const id = row.original.id

        const getPriorityStyles = (p: string) => {
          switch (p) {
            case 'HIGH': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
            case 'LOW': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            default: return 'bg-muted text-muted-foreground hover:bg-muted/80'
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all duration-300 outline-hidden ${getPriorityStyles(priority)}`}
              >
                <AlertCircleIcon className="w-3.5 h-3.5" />
                {priority.toLowerCase()}
                <ChevronDownIcon className="w-3 h-3 ml-0.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl">
              <DropdownMenuItem onClick={() => handlePriorityChange(id, 'HIGH')} className="flex items-center gap-2 font-bold text-xs uppercase text-red-500">High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(id, 'MEDIUM')} className="flex items-center gap-2 font-bold text-xs uppercase text-yellow-500">Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(id, 'LOW')} className="flex items-center gap-2 font-bold text-xs uppercase text-green-500">Low</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(id, 'UNKNOWN')} className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground">Unknown</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(row.original.id)}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      ),
    }
  ]

  return (
    <>
      <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Inquiries</h1>
              <p className="text-muted-foreground text-sm">Manage and respond to messages from the contact form.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsAddOpen(true)}
                className="bg-[#214347] dark:bg-emerald-600 text-white hover:bg-[#163033] dark:hover:bg-emerald-500 rounded-xl font-bold text-xs uppercase tracking-wider h-10 px-4 flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Lead
              </Button>
              <Button
                variant="outline"
                onClick={fetchMessages}
                disabled={isLoading}
                className="rounded-xl border-border hover:bg-muted font-bold text-xs uppercase tracking-wider h-10"
              >
                <RefreshCcwIcon className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-6 items-end bg-card p-4 rounded-2xl border border-border/50">
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Inquiry Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 border-border bg-transparent font-medium text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {inquiryTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setFilterStatus("all"); setFilterPriority("all"); setFilterType("all"); }}
              className="text-xs font-bold text-muted-foreground h-9 hover:bg-muted"
            >
              <RefreshCcwIcon className="w-3 h-3 mr-2" />
              Reset
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredMessages}
            isLoading={isLoading}
            filterColumn="sender"
            filterPlaceholder="Search by name or email..."
          />
        </div>

        {/* Add Lead Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-[600px] w-[95vw] bg-white dark:bg-[#0c1425] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl transition-colors duration-300">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-[#214347] dark:text-emerald-400 tracking-tight flex items-center gap-2">
                <PlusIcon className="w-6 h-6" />
                Add New Lead
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Create a new lead manually in the property management system.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddLead} className="space-y-6">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                    First Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="rounded-xl border-border bg-transparent text-sm h-10 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                    Last Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="rounded-xl border-border bg-transparent text-sm h-10 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                    Email Address <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="rounded-xl border-border bg-transparent text-sm h-10 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+25261..."
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="rounded-xl border-border bg-transparent text-sm h-10 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Inquiry Type, Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="inquiryType" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                    Inquiry Type
                  </Label>
                  <Select
                    value={formData.inquiryType}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, inquiryType: val }))}
                  >
                    <SelectTrigger className="rounded-xl border-border bg-transparent text-sm h-10 font-medium">
                      <SelectValue placeholder="Renting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Renting">Renting</SelectItem>
                      <SelectItem value="Buying">Buying</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="status" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="rounded-xl border-border bg-transparent text-sm h-10 font-medium">
                      <SelectValue placeholder="New" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="CONVERTED">Converted</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="priority" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
                  >
                    <SelectTrigger className="rounded-xl border-border bg-transparent text-sm h-10 font-medium">
                      <SelectValue placeholder="Unknown" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNKNOWN">Unknown</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Message */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="message" className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider ml-1">
                  Lead Notes / Message <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="What is this lead interested in or what did they request?"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="rounded-xl border-border bg-transparent text-sm font-medium resize-none"
                />
              </div>

              <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl font-bold uppercase tracking-wider px-6 h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#214347] dark:bg-emerald-600 text-white hover:bg-[#163033] dark:hover:bg-emerald-500 rounded-xl font-bold uppercase tracking-wider px-6 h-10 text-xs"
                >
                  {isSubmitting ? "Creating..." : "Save Lead"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </>
  )
}
