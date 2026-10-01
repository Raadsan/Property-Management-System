"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPropertyReport } from "@/api/reportApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PropertyReportPage() {
  const [data, setData] = React.useState<any>(null)
  
  React.useEffect(() => {
    getPropertyReport().then(setData).catch(console.error)
  }, [])

  return (
<div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Property Report</h1>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Analytics and performance metrics for listed properties.</p>
          
          {data && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{data.totalProperties}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Available Properties</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-blue-600">{data.availableProperties}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Booked Properties</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-orange-600">{data.bookedProperties}</p></CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Properties Overview</CardTitle>
              <CardDescription>Track occupancy rates, popular properties, and listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto"><Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Bookings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.properties?.length ? data.properties.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.propertyType?.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell>{p.owner?.name}</TableCell>
                      <TableCell>{p._count?.bookings || 0}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No properties found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
)
}
