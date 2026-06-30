"use client"

import { useState, useEffect, type ComponentType } from "react"
import { 
  Users, 
  RefreshCcw, 
  FileText,
  FolderOpen,
  Loader2Icon,
  MoreVertical,
  Building2,
  PieChart,
} from "lucide-react"
import api from "@/api/axios"
import { useTheme } from "@teispace/next-themes"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Cell, Label, Pie, PieChart as RechartsPieChart } from "recharts"

function CircularProgress({
  percent,
  color,
  size = 52,
}: {
  percent: number
  color: string
  size?: number
}) {
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percent))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-black/5 dark:text-white/10"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
        {clamped}%
      </span>
    </div>
  )
}

type StatCardProps = {
  value: string
  subtitle: string
  icon: ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
  progressPercent: number
  accentColor: string
  accentBg: string
}

function StatCard({
  value,
  subtitle,
  icon: Icon,
  progressPercent,
  accentColor,
  accentBg,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-black/30">
      <div className="relative mb-5 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm dark:shadow-none"
          style={{ backgroundColor: accentBg }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: accentColor }} strokeWidth={1.75} />
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[26px] font-bold leading-none tracking-tight text-foreground">
            {value}
            <span className="text-[18px] font-bold text-muted-foreground">+</span>
          </p>
          <p className="mt-2 truncate text-[13px] font-medium text-muted-foreground">{subtitle}</p>
        </div>
        <CircularProgress percent={progressPercent} color={accentColor} />
      </div>
    </div>
  )
}
function PropertyCategoryBarChart({ categories, total }: { categories?: any[], total?: number }) {
  const palette = [
    { solid: "#9b6dff", track: "#f3f0ff", gradient: "linear-gradient(180deg, #b794ff 0%, #9b6dff 100%)" },
    { solid: "#4d8bff", track: "#eef4ff", gradient: "linear-gradient(180deg, #6ba3ff 0%, #4d8bff 100%)" },
    { solid: "#26c08e", track: "#ecfdf5", gradient: "linear-gradient(180deg, #3dd4a3 0%, #26c08e 100%)" },
    { solid: "#214347", track: "#eef4f4", gradient: "linear-gradient(180deg, #2f5a5f 0%, #214347 100%)" },
    { solid: "#f59e0b", track: "#fffbeb", gradient: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)" },
    { solid: "#ec4899", track: "#fdf2f8", gradient: "linear-gradient(180deg, #f472b6 0%, #ec4899 100%)" },
  ]

  const data = categories
    ? categories
        .map((c) => ({ name: c.name, count: c._count?.properties || 0 }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count)
    : []

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const propertyTotal = total ?? data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15">
            <Building2 className="h-5 w-5 text-primary dark:text-[#eae1d2]" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Properties by Category</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground/90">{propertyTotal}</span> properties
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-center">
          <Building2 className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No property categories to display yet</p>
        </div>
      ) : (
        <div className="flex items-end justify-center gap-6 px-2 sm:gap-10 sm:px-6">
          {data.map((item, i) => {
            const color = palette[i % palette.length]
            const heightPct = Math.max((item.count / maxCount) * 100, 8)

            return (
              <div
                key={item.name}
                className="group flex h-[240px] max-w-[96px] flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-sm font-bold text-foreground transition-transform duration-300 group-hover:scale-110">
                  {item.count}
                </span>

                <div className="relative flex h-[190px] w-12 items-end justify-center overflow-hidden rounded-t-2xl bg-muted/50 dark:bg-muted/30 sm:w-14">
                  <div
                    className="w-full rounded-t-2xl shadow-sm transition-all duration-700 ease-out group-hover:shadow-md"
                    style={{
                      height: `${heightPct}%`,
                      background: color.gradient,
                    }}
                  />
                </div>

                <span className="mt-3 w-full truncate text-center text-xs font-semibold text-muted-foreground">
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      )}
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
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
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
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
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

const PIE_COLORS = ["#9b6dff", "#4d8bff", "#26c08e", "#214347", "#f59e0b", "#ec4899"]

function BlogCategoryPieChart({ categories, total }: { categories?: any[]; total?: number }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const pieStroke = isDark ? "#2a2a2a" : "#ffffff"
  const centerValueFill = isDark ? "#f5f5f5" : "#111827"
  const centerLabelFill = isDark ? "#a3a3a3" : "#6b7280"

  const chartData = categories
    ? categories
        .map((c) => ({ name: c.name, value: c._count?.blogs || 0 }))
        .filter((c) => c.value > 0)
        .sort((a, b) => b.value - a.value)
    : []

  const blogTotal = total ?? chartData.reduce((sum, item) => sum + item.value, 0)

  const chartConfig = chartData.reduce<ChartConfig>((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }
    return acc
  }, {})

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15">
          <PieChart className="h-5 w-5 text-primary dark:text-[#eae1d2]" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">Blog Category Pie Chart</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Distribution across <span className="font-semibold text-foreground/90">{blogTotal}</span> blogs
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-center">
          <PieChart className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No blog category data to display yet</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[280px]">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={3}
                strokeWidth={3}
                stroke={pieStroke}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                    const cx = viewBox.cx as number
                    const cy = viewBox.cy as number

                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={cx} y={cy - 4} fill={centerValueFill} fontSize={28} fontWeight={700}>
                          {blogTotal}
                        </tspan>
                        <tspan x={cx} y={cy + 18} fill={centerLabelFill} fontSize={12} fontWeight={500}>
                          Total
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </RechartsPieChart>
          </ChartContainer>

          <div className="w-full flex-1 space-y-3 lg:max-w-xs">
            {chartData.map((item, index) => {
              const percent = blogTotal > 0 ? Math.round((item.value / blogTotal) * 100) : 0
              const color = PIE_COLORS[index % PIE_COLORS.length]

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">{percent}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
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
    {
      value: data?.totalBlogCategories || 0,
      subtitle: "Category",
      icon: FolderOpen,
      accentColor: "#5B8DEF",
      accentBg: "rgba(91, 141, 239, 0.15)",
    },
    {
      value: data?.totalProperties || 0,
      subtitle: "Property",
      icon: RefreshCcw,
      accentColor: "#34C759",
      accentBg: "rgba(52, 199, 89, 0.15)",
    },
    {
      value: data?.totalBlogs || 0,
      subtitle: "Blogs",
      icon: FileText,
      accentColor: "#214347",
      accentBg: "rgba(33, 67, 71, 0.15)",
    },
    {
      value: data?.totalUsers || 0,
      subtitle: "Users",
      icon: Users,
      accentColor: "#FF7B9C",
      accentBg: "rgba(255, 123, 156, 0.15)",
    },
  ]

  const maxValue = Math.max(...stats.map((s) => Number(s.value)), 1)

  return (
    <div className="flex flex-1 flex-col bg-background min-h-screen p-8 gap-8 font-sans">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const num = Number(s.value)
          const progressPercent = num === 0 ? 0 : Math.max(8, Math.round((num / maxValue) * 100))

          return (
            <StatCard
              key={i}
              value={s.value.toString()}
              subtitle={s.subtitle}
              icon={s.icon}
              progressPercent={progressPercent}
              accentColor={s.accentColor}
              accentBg={s.accentBg}
            />
          )
        })}
      </div>

      {/* Row 2: Property Bars & Blog Category Pie Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PropertyCategoryBarChart categories={data?.propertyCategories} total={data?.totalProperties} />
        <BlogCategoryPieChart categories={data?.blogCategories} total={data?.totalBlogs} />
      </div>

      {/* Row 3: Latest Users Table */}
      <div className="grid grid-cols-1 gap-6">
        <LatestUsersTable users={data?.latestUsers} />
      </div>
    </div>
  )
}
