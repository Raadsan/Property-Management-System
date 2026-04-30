"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserActivityReport } from "@/api/reportApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserActivityReportPage() {
  const [data, setData] = React.useState<any>(null)
  
  React.useEffect(() => {
    getUserActivityReport().then(setData).catch(console.error)
  }, [])

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
          <h1 className="text-2xl font-bold tracking-tight">User Activity Report</h1>
          <p className="text-muted-foreground mb-6">Monitor user engagement, registrations, and platform usage.</p>
          
          {data && (
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{data.totalUsers}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-green-600">{data.activeUsers}</p></CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
              <CardDescription>Detailed usage statistics per user account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Properties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users?.length ? data.users.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name}
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell>{u.role?.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell>{u._count?.bookings || 0}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${Number(u.totalPaid || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{u._count?.propertiesOwned || 0}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
