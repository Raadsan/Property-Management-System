"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  DollarSign, 
  ShoppingCart, 
  RefreshCcw, 
  Plus, 
  Calendar,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Loader2Icon
} from "lucide-react"
import api from "@/api/axios"

/* ─── Components ────────────────────────────────────────────── */

function StatCard({ title, value, trend, icon: Icon, isIncrease }: { title: string; value: string; trend: string; icon: any; isIncrease: boolean }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Icon className="w-4 h-4" />
        <span className="text-[13px] font-medium">{title}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <div className={`flex items-center gap-1 text-[13px] font-bold ${isIncrease ? "text-emerald-500" : "text-red-500"}`}>
          {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trend}
        </div>
      </div>
    </div>
  )
}
function PropertyCategoryBarChart({ categories, total }: { categories?: any[], total?: number }) {
  const defaultData = [
    { name: "Apartment", count: 45 },
    { name: "Villa", count: 28 },
    { name: "Office", count: 17 },
    { name: "Shop", count: 12 },
    { name: "Studio", count: 9 },
  ]
  const data = categories
    ? categories.map(c => ({ name: c.name, count: c._count?.properties || 0 })).filter(c => c.count > 0)
    : defaultData

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#f43f5e", "#60a5fa", "#22c55e"]

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-foreground">Properties by Category</h3>
          <p className="text-xs text-muted-foreground">Total: {total ?? data.reduce((s, d) => s + d.count, 0)} properties</p>
        </div>
      </div>

      <div className="flex items-end justify-around gap-6 h-[280px] px-8 border-b border-muted/50 pb-2">
        {data.map((item, i) => {
          const heightPct = (item.count / maxCount) * 100
          return (
            <div key={i} className="flex flex-col items-center gap-3 flex-1 h-full justify-end">
              <span className="text-[12px] font-bold text-foreground mb-1">{item.count}</span>
              <div className="w-10 flex items-end justify-center bg-muted/5 rounded-t-md" style={{ height: "200px" }}>
                <div
                  className="w-full rounded-t-md transition-all duration-700 ease-out relative group cursor-pointer"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: colors[i % colors.length],
                    minHeight: "4px",
                  }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                    {item.name}: {item.count}
                  </div>
                  <div className="absolute inset-0 rounded-t-md bg-white/5" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground text-center leading-tight truncate w-full">{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}


function LatestUsersTable({ users }: { users?: any[] }) {
  const defaultUsers = [
    { name: "Ahmed Farah", email: "ahmed@example.com", phone: "+252 61 123 4567", status: "ACTIVE", createdAt: new Date() },
    { name: "Hassan Ali", email: "hassan@example.com", phone: "+252 61 765 4321", status: "ACTIVE", createdAt: new Date() },
  ]
  const data = users || defaultUsers

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Latest Registered Users</h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Role: User</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-4 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="pb-4 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
              <th className="pb-4 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="pb-4 text-[12px] font-bold text-muted-foreground uppercase tracking-wider text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((user, i) => (
              <tr key={i} className="group hover:bg-muted/30 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {user.photo ? <img src={user.photo} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                    </div>
                    <span className="text-[14px] font-bold text-foreground">{user.name}</span>
                  </div>
                </td>
                <td className="py-4">
                  <p className="text-[13px] text-foreground">{user.email}</p>
                  <p className="text-[11px] text-muted-foreground">{user.phone}</p>
                </td>
                <td className="py-4">
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                     {user.status}
                   </span>
                </td>
                <td className="py-4 text-right text-[12px] text-muted-foreground font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TopUsersList({ users }: { users?: any[] }) {
  const defaultUsers = [
    { name: "Raadsan Teach", email: "admin@raadsan.com", propertyCount: 12, photo: null },
    { name: "Damal Group", email: "info@damal.so", propertyCount: 8, photo: null },
    { name: "Somali Real Estate", email: "contact@somali.com", propertyCount: 5, photo: null },
  ]
  const data = users || defaultUsers

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 overflow-hidden">
      <h3 className="text-lg font-bold text-foreground mb-6">Top 5 Owners</h3>
      <div className="space-y-4">
        {data.map((user, i) => (
          <div key={i} className="flex items-center justify-between group p-2 hover:bg-muted/30 rounded-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-[14px] font-bold text-foreground leading-tight">{user.name}</p>
                <p className="text-[12px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-bold text-primary">{user.propertyCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Properties</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────────── */

export function DashboardContent() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/dashboard/stats')
        setData(response.data)
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { title: "Total Properties", value: data?.totalProperties || 0, trend: "2.5%", isIncrease: true, icon: RefreshCcw },
    { title: "Total Revenue", value: `$${(data?.realTotalRevenue || 0).toLocaleString()}`, trend: "0.5%", isIncrease: true, icon: DollarSign },
    { title: "Total Bookings", value: data?.totalBookings || 0, trend: "0.2%", isIncrease: false, icon: ShoppingCart },
    { title: "Total Users", value: data?.totalUsers || 0, trend: "0.12%", isIncrease: true, icon: Users },
  ]

  return (
    <div className="flex flex-1 flex-col bg-background min-h-screen p-8 gap-8 font-sans">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value.toString()} trend={s.trend} icon={s.icon} isIncrease={s.isIncrease} />
        ))}
      </div>

      {/* Row 2: Property Bars & Top 10 Users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PropertyCategoryBarChart categories={data?.propertyCategories} total={data?.totalProperties} />
        <TopUsersList users={data?.topUsers} />
      </div>

      {/* Row 3: Latest Users Table */}
      <div className="grid grid-cols-1 gap-6">
        <LatestUsersTable users={data?.latestUsers} />
      </div>
    </div>
  )
}
