"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategoryReport } from "@/api/reportApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CategoryReportPage() {
  const [data, setData] = React.useState<any>(null)
  
  React.useEffect(() => {
    getCategoryReport().then(setData).catch(console.error)
  }, [])

  return (
<div className="flex flex-1 flex-col p-4 md:p-6">
          <h1 className="text-2xl font-bold tracking-tight">Category Report</h1>
          <p className="text-muted-foreground mb-6">Insights on property categories and their distribution.</p>
          
          <Card>
            <CardHeader>
              <CardTitle>Categories Overview</CardTitle>
              <CardDescription>Understand which categories perform best.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Listed Properties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.categories?.length ? data.categories.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c._count?.properties || 0}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">No categories found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
)
}
