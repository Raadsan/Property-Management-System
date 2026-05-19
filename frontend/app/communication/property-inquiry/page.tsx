"use client"

import * as React from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { getPropertyInquiries, deletePropertyInquiry } from "@/api/propertyInquiryApi"
import { toast } from "sonner"
import { format } from "date-fns"
import { RefreshCcwIcon, PhoneIcon, CalendarIcon, Trash2Icon, MailIcon, UserIcon, HomeIcon, EyeIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"

export type PropertyInquiry = {
  id: number
  fullName: string
  email: string
  phone: string
  message: string
  propertyId: number
  createdAt: string
  property: {
    title: string
    city: string
    location: string
    price: number
  }
}

export default function PropertyInquiryDashboardPage() {
  const [inquiries, setInquiries] = React.useState<PropertyInquiry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Message View Modal States
  const [selectedInquiry, setSelectedInquiry] = React.useState<PropertyInquiry | null>(null)
  const [isViewOpen, setIsViewOpen] = React.useState(false)

  const fetchInquiries = async () => {
    setIsLoading(true)
    try {
      const response = await getPropertyInquiries()
      const list = Array.isArray(response) ? response : (response as any)?.data || []
      setInquiries(list)
    } catch (error: any) {
      console.error("Fetch inquiries error:", error)
      toast.error("Could not fetch property inquiries.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return
    try {
      await deletePropertyInquiry(id)
      setInquiries(prev => prev.filter(inq => inq.id !== id))
      toast.success("Property inquiry deleted successfully!")
    } catch (error) {
      console.error("Delete inquiry error:", error)
      toast.error("Failed to delete inquiry.")
    }
  }

  React.useEffect(() => {
    fetchInquiries()
  }, [])

  const columns: ColumnDef<PropertyInquiry>[] = [
    {
      accessorKey: "sender",
      header: "Sender",
      cell: ({ row }) => {
        const inq = row.original
        return (
          <div className="flex flex-col py-1 gap-1">
            <span className="font-bold text-foreground text-[15px]">{inq.fullName}</span>
            <span className="text-[13px] text-muted-foreground font-medium">{inq.email}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
              <PhoneIcon className="w-3 h-3" />
              {inq.phone || "N/A"}
            </div>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const name = row.original.fullName.toLowerCase()
        const email = row.original.email.toLowerCase()
        return name.includes(value.toLowerCase()) || email.includes(value.toLowerCase())
      }
    },
    {
      accessorKey: "property",
      header: "Interested Property",
      cell: ({ row }) => {
        const inq = row.original
        if (!inq.property) return <span className="text-muted-foreground text-xs font-semibold">Unknown Property</span>
        const slugify = (text: string) => {
          return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
        };
        const propertyUrl = `/properties/${slugify(inq.property.title)}`;

        return (
          <Link href={propertyUrl} className="group flex flex-col py-1 gap-1 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-[14px] group-hover:underline">
              <HomeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{inq.property.title}</span>
            </div>
            <span className="text-[12px] text-muted-foreground/75 pl-5">
              {inq.property.city}, {inq.property.location}
            </span>
            <span className="text-[13px] text-emerald-600 dark:text-emerald-400 font-black pl-5">
              ${inq.property.price.toLocaleString()}
            </span>
          </Link>
        )
      }
    },
    {
      accessorKey: "message",
      header: "Message Content",
      cell: ({ row }) => {
        const msg = row.getValue("message") as string
        return (
          <p className="text-muted-foreground text-[14px] leading-relaxed line-clamp-2 max-w-sm hover:line-clamp-none transition-all duration-300 cursor-default">
            {msg}
          </p>
        )
      },
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
            <span className="text-[11px] text-muted-foreground/50 font-medium pl-5">
              at {format(date, 'HH:mm')}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedInquiry(row.original)
              setIsViewOpen(true)
            }}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Delete Inquiry"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
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
              <h1 className="text-2xl font-bold tracking-tight">Property Inquiries</h1>
              <p className="text-muted-foreground text-sm">Manage and respond to direct client inquiries regarding specific properties.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchInquiries}
                disabled={isLoading}
                className="rounded-xl border-border hover:bg-muted font-bold text-xs uppercase tracking-wider h-10 px-5"
              >
                <RefreshCcwIcon className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={inquiries}
            isLoading={isLoading}
            filterColumn="sender"
            filterPlaceholder="Search by sender name or email..."
          />
        </div>
      </SidebarInset>

      {/* Inquiry Detail View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] bg-white dark:bg-[#0c1425] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl transition-colors duration-300">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black text-[#214347] dark:text-emerald-400 tracking-tight">Inquiry Details</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Received on {selectedInquiry && format(new Date(selectedInquiry.createdAt), 'MMM dd, yyyy at HH:mm')}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6 text-gray-800 dark:text-gray-200">
              {/* Sender Details */}
              <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">Sender Profile</span>
                <div className="flex flex-col gap-1 text-[14px]">
                  <span className="font-extrabold text-gray-900 dark:text-white">{selectedInquiry.fullName}</span>
                  <span className="text-muted-foreground dark:text-gray-400">{selectedInquiry.email}</span>
                  <span className="text-muted-foreground dark:text-gray-400">{selectedInquiry.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Property Details */}
              {selectedInquiry.property && (
                <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">Property of Interest</span>
                  <div className="flex flex-col gap-1 text-[14px]">
                    <span className="font-extrabold text-[#214347] dark:text-emerald-400">{selectedInquiry.property.title}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-semibold text-xs">{selectedInquiry.property.city}, {selectedInquiry.property.location}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">${selectedInquiry.property.price.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Message Details */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">Message</span>
                <div className="bg-[#214347]/5 dark:bg-emerald-950/20 text-gray-800 dark:text-gray-200 rounded-2xl p-5 border border-[#214347]/10 dark:border-emerald-800/30 max-h-[200px] overflow-y-auto leading-relaxed whitespace-pre-wrap text-[13.5px] font-sans break-all break-words overflow-x-hidden">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-gray-800">
                <Button
                  onClick={() => setIsViewOpen(false)}
                  className="bg-[#214347] dark:bg-emerald-600 text-white hover:bg-[#163033] dark:hover:bg-emerald-500 rounded-2xl font-bold uppercase tracking-wider px-6 h-10 text-xs cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
