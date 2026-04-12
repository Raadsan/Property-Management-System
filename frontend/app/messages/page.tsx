"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MailOpenIcon, MailIcon, RefreshCcwIcon, PhoneIcon, CalendarIcon } from "lucide-react"
import { getContactMessages } from "@/api/contactApi"
import { toast } from "sonner"
import { format } from "date-fns"

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

  React.useEffect(() => {
    fetchMessages()
  }, [])

  // Column definitions for DataTable
  const columns: ColumnDef<Message>[] = [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${row.getValue("status") === 'READ' ? 'bg-gray-100' : 'bg-[#e6f2f3]'}`}>
           {row.getValue("status") === 'READ' ? (
               <MailOpenIcon className="w-4 h-4 text-gray-400" />
           ) : (
               <MailIcon className="w-4 h-4 text-[#214347]" />
           )}
        </div>
      ),
    },
    {
      accessorKey: "sender",
      header: "Sender",
      cell: ({ row }) => {
        const msg = row.original
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-[#334155] text-[15px]">{msg.firstName} {msg.lastName}</span>
            <span className="text-[13px] text-gray-500 font-medium">{msg.email}</span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
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
              type === 'Support' ? 'bg-orange-50 text-orange-600 border-orange-100' :
              type === 'Renting' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              type === 'Buying' ? 'bg-purple-50 text-purple-600 border-purple-100' :
              'bg-gray-50 text-gray-600 border-gray-100'
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
        <p className="text-[#64748b] text-[14px] leading-relaxed line-clamp-2 max-w-sm hover:line-clamp-none transition-all duration-300 cursor-default">
          {row.getValue("message")}
        </p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right pr-6">Date Received</div>,
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="flex flex-col items-end pr-6">
            <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[12px]">
               <CalendarIcon className="w-3.5 h-3.5" />
               {format(date, 'MMM dd, yyyy')}
            </div>
            <span className="text-[11px] text-gray-300 font-medium">
               at {format(date, 'HH:mm')}
            </span>
          </div>
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
        <div className="flex flex-1 flex-col p-4 md:p-6 bg-white min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#1e293b]">User Inquiries</h1>
              <p className="text-muted-foreground text-sm">Manage and respond to messages from the contact form.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                  variant="outline" 
                  onClick={fetchMessages} 
                  disabled={isLoading}
                  className="rounded-xl border-gray-200 hover:bg-gray-50 font-bold text-xs uppercase tracking-wider h-10"
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
