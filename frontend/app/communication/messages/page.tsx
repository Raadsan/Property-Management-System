"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { getContactMessages, updateContactStatus } from "@/api/contactApi"
import { toast } from "sonner"
import { format } from "date-fns"
import { CheckCircle2Icon, ClockIcon, RefreshCcwIcon, PhoneIcon, CalendarIcon, ChevronDownIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  createdAt: string
}

export default function MessagesDashboardPage() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

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
      toast.success(`Marked as ${newStatus}`)
    } catch (error) {
      console.error("Update status error:", error)
      toast.error("Failed to update status")
    }
  }

  React.useEffect(() => {
    fetchMessages()
  }, [])

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
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border ${
              type === 'Support' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
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
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all duration-300 outline-hidden ${
                  status === 'SOLVED' 
                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                    : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                }`}
              >
                {status === 'SOLVED' ? (
                  <CheckCircle2Icon className="w-3.5 h-3.5" />
                ) : (
                  <ClockIcon className="w-3.5 h-3.5" />
                )}
                {status.toLowerCase()}
                <ChevronDownIcon className="w-3 h-3 ml-0.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl">
              <DropdownMenuItem 
                onClick={() => status !== 'PENDING' && handleStatusChange(id, 'PENDING')}
                className="flex items-center gap-2 font-bold text-xs uppercase text-amber-500"
              >
                <ClockIcon className="w-3.5 h-3.5" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => status !== 'SOLVED' && handleStatusChange(id, 'SOLVED')}
                className="flex items-center gap-2 font-bold text-xs uppercase text-green-500"
              >
                <CheckCircle2Icon className="w-3.5 h-3.5" />
                Solved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
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
              <h1 className="text-2xl font-bold tracking-tight">User Inquiries</h1>
              <p className="text-muted-foreground text-sm">Manage and respond to messages from the contact form.</p>
            </div>
            <div className="flex items-center gap-3">
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

          <DataTable 
            columns={columns} 
            data={messages} 
            isLoading={isLoading} 
            filterColumn="sender"
            filterPlaceholder="Search by name or email..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
