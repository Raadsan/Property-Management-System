"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTransactionReport } from "@/api/reportApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TransactionReportPage() {
  const [data, setData] = React.useState<any>(null)
  
  React.useEffect(() => {
    getTransactionReport().then(setData).catch(console.error)
  }, [])

  return (
<div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Transaction Report</h1>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Detailed history and summaries of financial transactions.</p>
          
          {/* {data && (
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (Paid)</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-green-600">${data.totalRevenue.toFixed(2)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Revenue</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-yellow-600">${data.pendingRevenue.toFixed(2)}</p></CardContent>
              </Card>
            </div>
          )} */}

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>A list of all processed and pending payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto"><Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.payments?.length ? data.payments.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.user?.name || "Unknown"}</TableCell>
                      <TableCell>{p.booking?.property?.title || "N/A"}</TableCell>
                      <TableCell>${parseFloat(p.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : p.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No transactions found.</TableCell>
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
