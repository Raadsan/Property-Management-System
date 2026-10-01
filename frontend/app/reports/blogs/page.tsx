"use client"

import * as React from "react"
import { getBlogReport, BlogReportData } from "@/api/reportApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, CalendarDays, FolderOpen, Loader2, Search, Users } from "lucide-react"

export default function BlogReportPage() {
  const [data, setData] = React.useState<BlogReportData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState("all")

  React.useEffect(() => {
    getBlogReport()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load blog report"))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredBlogs = React.useMemo(() => {
    if (!data) return []
    const query = search.trim().toLowerCase()
    return data.blogs.filter((blog) => {
      const matchesCategory = category === "all" || blog.categoryId.toString() === category
      const matchesSearch = !query || blog.title.toLowerCase().includes(query) || blog.author.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [data, search, category])

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-[#214347]" /></div>
  }

  if (error || !data) {
    return <div className="flex flex-1 items-center justify-center p-10 text-sm text-red-600">{error || "No report data available."}</div>
  }

  const metrics = [
    { label: "Total Articles", value: data.totalBlogs, icon: BookOpen, color: "text-[#214347]" },
    { label: "Categories Used", value: data.totalCategories, icon: FolderOpen, color: "text-blue-600" },
    { label: "Authors", value: data.totalAuthors, icon: Users, color: "text-violet-600" },
    { label: "Published This Month", value: data.publishedThisMonth, icon: CalendarDays, color: "text-emerald-600" },
  ]

  return (
    <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6 min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Blog Report</h1>
      <p className="mb-4 sm:mb-6 text-sm text-muted-foreground">Track article publishing, authors, categories, and connected social links.</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>
              <div className="rounded-xl bg-muted p-3"><Icon className={`h-5 w-5 ${color}`} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Articles registered in each category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.categories.length ? data.categories.map((item) => {
              const percentage = data.totalBlogs ? Math.round((item.count / data.totalBlogs) * 100) : 0
              return (
                <div key={item.id}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{item.name}</span><span className="text-muted-foreground">{item.count}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#214347]" style={{ width: `${percentage}%` }} /></div>
                </div>
              )
            }) : <p className="py-6 text-center text-sm text-muted-foreground">No category data.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article Overview</CardTitle>
            <CardDescription>Detailed report of registered blog articles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or author..." className="pl-9" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data.categories.map((item) => <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table className="min-w-[720px]">
                <TableHeader><TableRow><TableHead>Article</TableHead><TableHead>Category</TableHead><TableHead>Registered By</TableHead><TableHead>Socials</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredBlogs.length ? filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell><p className="max-w-[260px] truncate font-medium">{blog.title}</p><p className="text-xs text-muted-foreground">By {blog.author}</p></TableCell>
                      <TableCell><span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{blog.category?.name || "Uncategorized"}</span></TableCell>
                      <TableCell>{blog.createdBy?.name || blog.author}</TableCell>
                      <TableCell>{blog._count?.socials || 0}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No articles match the selected filters.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
