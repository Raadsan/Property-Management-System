"use client"

import { useState, useEffect } from "react"
import { ArrowRight, MapPin, Eye, Pencil, Zap } from "lucide-react"
import api from "@/api/axios"

/* ─── Inline SVG Sparkline ─────────────────────────────────── */
function Sparkline({ data, colorClass = "stroke-primary", fillClass = "fill-primary", fill = false }: { data: number[]; colorClass?: string; fillClass?: string; fill?: boolean }) {
  const w = 80, h = 32
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  }).join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {fill && <path d={`M${pts.replace(/,/g," L").replace("L","")} L${w},${h} L0,${h} Z`} className={fillClass} fillOpacity="0.08"/>}
      <polyline points={pts} fill="none" className={colorClass} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Inline SVG Bar Chart ──────────────────────────────────── */
function BarChart({ data }: { data: { a: number; b: number }[] }) {
  const max = Math.max(...data.flatMap(d => [d.a, d.b]))
  const safeMax = max > 0 ? max : 1;
  const h = 200, barW = 7, gap = 4, groupGap = 10
  const totalW = data.length * (barW * 2 + gap + groupGap)
  const yLabels = ["40", "20"]
  return (
    <div className="relative">
      {/* Y-axis labels on right */}
      <div className="absolute right-0 top-0 h-full flex flex-col justify-between pb-1 pr-1">
        {yLabels.map(l => <span key={l} className="text-[9px] text-muted-foreground font-medium">{l}</span>)}
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${totalW} ${h}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={0} x2={totalW} y1={h * f} y2={h * f} className="stroke-border" strokeWidth="1"/>
        ))}
        {data.map((d, i) => {
          const x = i * (barW * 2 + gap + groupGap)
          const aH = (d.a / safeMax) * (h - 10)
          const bH = (d.b / safeMax) * (h - 10)
          return (
            <g key={i}>
              <rect x={x} y={h - aH} width={barW} height={aH} rx="3" className="fill-foreground opacity-90" />
              <rect x={x + barW + gap} y={h - bH} width={barW} height={bH} rx="3" className="fill-muted-foreground opacity-30" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ─── Inline SVG Line Chart (dual lines + avg + cursor) ────────── */
function LineChart({ data, dataSep }: { data: number[]; dataSep: number[] }) {
  const w = 500, h = 190
  const allVals = [...data, ...dataSep]
  const min = Math.min(...allVals), max = Math.max(...allVals)
  const scaleY = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 24) - 12
  const scaleX = (i: number) => (i / (data.length - 1)) * w

  const octPts = data.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ")
  const sepPts = dataSep.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ")
  const avg = allVals.reduce((a, b) => a + b, 0) / allVals.length
  const avgY = scaleY(avg)
  const cursorX = scaleX(data.length - 4)   // ~25 on axis
  const yLabels = ["1.5m", "1m"]

  return (
    <div className="relative text-foreground">
      {/* Y-axis labels right */}
      <div className="absolute right-0 top-0 h-full flex flex-col justify-between pb-4 pr-2">
        {yLabels.map(l => <span key={l} className="text-[9px] text-muted-foreground font-medium">{l}</span>)}
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        
        {/* Fill - CSS driven so it matches current mode */}
        <path
          d={`M${octPts.split(" ").join(" L")} L${w},${h} L0,${h} Z`}
          className="fill-primary opacity-5"
        />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={0} x2={w} y1={h * f} y2={h * f} className="stroke-border" strokeWidth="1"/>
        ))}

        {/* Average dashed line */}
        <line x1={0} x2={w} y1={avgY} y2={avgY} className="stroke-muted-foreground opacity-50" strokeWidth="1" strokeDasharray="4 3"/>
        <text x={4} y={avgY - 4} fontSize="8" className="fill-muted-foreground">Average</text>

        {/* Vertical cursor */}
        <line x1={cursorX} x2={cursorX} y1={0} y2={h} className="stroke-foreground" strokeWidth="1" strokeDasharray="none" opacity="0.2"/>

        {/* Sep line */}
        <polyline points={sepPts} fill="none" className="stroke-muted-foreground opacity-70" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>

        {/* Oct line */}
        <polyline points={octPts} fill="none" className="stroke-primary" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>

        {/* Cursor dot */}
        <circle cx={cursorX} cy={scaleY(data[data.length - 4])} r="3" className="fill-background stroke-primary" strokeWidth="1.5"/>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1 px-0.5">
        {["5","10","15","20","25","30"].map(l => (
          <span key={l} className="text-[9px] text-muted-foreground font-medium">{l}</span>
        ))}
      </div>
    </div>
  )
}

/* ─── Gauge ─────────────────────────────────────────────────── */
function Gauge({ value, max = 100, hideText = false }: { value: number; max?: number; hideText?: boolean }) {
  const r = 28, cx = 36, cy = 36, sw = 6
  const pct = value / max
  const circ = Math.PI * r      // half circle
  const dash = pct * circ
  return (
    <svg width="72" height="44" viewBox="0 0 72 44">
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" className="stroke-muted" strokeWidth={sw} strokeLinecap="round"/>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" className="stroke-primary" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}/>
      {!hideText && (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" className="fill-foreground">{value}</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="8" className="fill-muted-foreground">/{max}</text>
        </>
      )}
    </svg>
  )
}

/* ─── Static data ────────────────────────────────────────────── */
const sparkScore = [68, 72, 70, 75, 74, 78, 76, 80, 79, 82]
const sparkA = [10, 14, 12, 18, 15, 22, 20, 28, 24, 30]
const sparkB = [5, 8, 6, 10, 9, 13, 12, 15, 11, 14]
const sparkC = [20, 18, 22, 19, 25, 23, 28, 26, 30, 29]

const lineDataOct = [820,760,900,830,980,920,1100,1050,1280,1200,1420,1380,1560,1500,1650,1580,1700,1640,1580,1700,1760,1680,1800,1720,1850,1900,1820,1950,1880,2000]
const lineDataSep = [700,740,680,810,750,870,820,950,880,1020,960,1100,1040,1150,1090,1200,1140,1250,1180,1300,1220,1350,1280,1400,1320,1450,1370,1480,1420,1500]
const barData  = [
  {a:20,b:12},{a:55,b:30},{a:30,b:18},{a:40,b:25},{a:80,b:50},
  {a:35,b:20},{a:90,b:60},{a:45,b:28},{a:70,b:42},{a:50,b:32},
  {a:100,b:68},{a:38,b:22},{a:60,b:38},
]

const listings = [
  { img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=120&q=80", price:"$850,000", beds:4, baths:3, sqm:233, days:101, city:"Mogadishu, Somalia", views:1317, viewsToday:31, tag:"SALE" },
  { img:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&q=80", price:"$650/mo",   beds:2, baths:1, sqm:98,  days:45,  city:"Hodan, Mogadishu",  views:824,  viewsToday:12, tag:"RENT" },
]

const owners = [
  { name:"Ahmed Hassan",  pct:79.3 },
  { name:"Faadumo Abdi",  pct:67.1 },
  { name:"Omar Jama",     pct:48.4 },
  { name:"Asad Warsame",  pct:38.9 },
]

/* ─── Exports ────────────────────────────────────────────────── */

export function SectionCards() { return null }

export function DashboardContent() {
  const [listingFilter, setListingFilter] = useState<'ALL' | 'SALE' | 'RENT'>('ALL')
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalBookings: 0,
    topOwners: [] as { name: string; pct: number }[],
    realTotalRevenue: 0,
    revenueCurrentMonth: [] as number[],
    revenueLastMonth: [] as number[],
    bookingsByMonth: [] as { a: number; b: number }[],
    saleCount: 0,
    rentCount: 0,
    recentListings: [] as any[]
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats')
        if (data) {
          setStats({
            totalProperties: data.totalProperties || 0,
            totalCategories: data.totalCategories || 0,
            totalUsers: data.totalUsers || 0,
            totalBookings: data.totalBookings || 0,
            topOwners: data.topOwners || [],
            realTotalRevenue: data.realTotalRevenue || 0,
            revenueCurrentMonth: data.revenueCurrentMonth || [],
            revenueLastMonth: data.revenueLastMonth || [],
            bookingsByMonth: data.bookingsByMonth || [],
            saleCount: data.saleCount || 0,
            rentCount: data.rentCount || 0,
            recentListings: data.recentListings || []
          })
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground min-h-screen p-4 lg:p-6 gap-4">

      {/* ── Row 1 — 4 stat cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Gauge card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1">Total Property</p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[28px] font-black text-foreground leading-none">{stats.totalProperties}</p>
              <p className="text-[11px] text-emerald-500 font-bold mt-1.5">↑18 <span className="text-muted-foreground font-normal">Last week</span></p>
            </div>
            {/* Platform Sparkline */}
            <Sparkline data={sparkScore} colorClass="stroke-emerald-500"/>
          </div>
          <div className="mt-2 text-[10px] text-primary font-semibold cursor-pointer flex items-center gap-0.5 hover:opacity-80">Show more <ArrowRight className="w-3 h-3"/></div>
        </div>

        {/* Total Listings */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1">Total Category</p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[28px] font-black text-foreground leading-none">{stats.totalCategories}</p>
              <p className="text-[11px] text-emerald-500 font-bold mt-1.5">↑20% <span className="text-muted-foreground font-normal">Last week</span></p>
            </div>
            <Sparkline data={sparkA} colorClass="stroke-primary"/>
          </div>
          <div className="mt-2 text-[10px] text-primary font-semibold cursor-pointer flex items-center gap-0.5 hover:opacity-80">Show more <ArrowRight className="w-3 h-3"/></div>
        </div>

        {/* Inquiries */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1">Total Users</p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[28px] font-black text-foreground leading-none">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-[11px] text-emerald-500 font-bold mt-1.5">↑12% <span className="text-muted-foreground font-normal">Last week</span></p>
            </div>
            <Sparkline data={sparkB} colorClass="stroke-cyan-500"/>
          </div>
          <div className="mt-2 text-[10px] text-primary font-semibold cursor-pointer flex items-center gap-0.5 hover:opacity-80">Show more <ArrowRight className="w-3 h-3"/></div>
        </div>

        {/* New Clients */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <p className="text-[11px] text-muted-foreground font-semibold mb-1">Total Booking</p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[28px] font-black text-foreground leading-none">{stats.totalBookings.toLocaleString()}</p>
              <p className="text-[11px] text-red-500 font-bold mt-1.5">↓34% <span className="text-muted-foreground font-normal">Last week</span></p>
            </div>
            <Sparkline data={sparkC} colorClass="stroke-amber-500"/>
          </div>
          <div className="mt-2 text-[10px] text-primary font-semibold cursor-pointer flex items-center gap-0.5 hover:opacity-80">Show more <ArrowRight className="w-3 h-3"/></div>
        </div>
      </div>

      {/* ── Row 2 — Charts ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Line chart */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Total Revenue</p>
              <p className="text-[26px] font-black text-foreground leading-tight">
                ${stats.realTotalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 text-[11px] text-muted-foreground font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block"/> Cur</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"/> Prev</span>
              <button className="bg-muted border border-border px-2 py-0.5 rounded-lg text-[10px] font-semibold text-foreground">Month ▾</button>
            </div>
          </div>
          <div className="mt-3">
            <LineChart 
              data={stats.revenueCurrentMonth.length > 0 ? stats.revenueCurrentMonth : Array(30).fill(0)} 
              dataSep={stats.revenueLastMonth.length > 0 ? stats.revenueLastMonth : Array(30).fill(0)}
            />
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Number of Bookings</p>
              <p className="text-[26px] font-black text-foreground leading-tight">{stats.totalBookings}</p>
            </div>
            <div className="flex gap-3 text-[11px] text-muted-foreground font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground inline-block"/> {new Date().getFullYear()}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"/> {new Date().getFullYear() - 1}</span>
              <button className="bg-muted border border-border px-2 py-0.5 rounded-lg text-[10px] font-semibold text-foreground">Year ▾</button>
            </div>
          </div>
          <BarChart data={stats.bookingsByMonth.length > 0 ? stats.bookingsByMonth : Array(12).fill({a:0, b:0})}/>
        </div>
      </div>

      {/* ── Row 3 — Listings + Efficiency ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Active listings */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[16px] font-black text-foreground">Active Listings</p>
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors hover:opacity-90">
              + New
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 text-[12px] font-semibold border-b border-border mb-4 pb-2">
            <button 
              onClick={() => setListingFilter('ALL')} 
              className={listingFilter === 'ALL' ? "text-foreground border-b-2 border-primary pb-2 -mb-2" : "text-muted-foreground hover:text-foreground pb-2 -mb-2"}
            >
              All <span className="text-muted-foreground font-normal ml-1">{stats.totalProperties}</span>
            </button>
            <button 
              onClick={() => setListingFilter('SALE')} 
              className={listingFilter === 'SALE' ? "text-foreground border-b-2 border-primary pb-2 -mb-2" : "text-muted-foreground hover:text-foreground pb-2 -mb-2"}
            >
              Sale <span className="text-muted-foreground font-normal ml-1">{stats.saleCount}</span>
            </button>
            <button 
              onClick={() => setListingFilter('RENT')} 
              className={listingFilter === 'RENT' ? "text-foreground border-b-2 border-primary pb-2 -mb-2" : "text-muted-foreground hover:text-foreground pb-2 -mb-2"}
            >
              Rent <span className="text-muted-foreground font-normal ml-1">{stats.rentCount}</span>
            </button>
          </div>

          {/* Listing rows */}
          <div className="space-y-4">
            {stats.recentListings.filter(l => listingFilter === 'ALL' || l.listingType === listingFilter).map((l, i) => {
              const daysActive = Math.floor((new Date().getTime() - new Date(l.createdAt).getTime()) / (1000 * 3600 * 24));
              let imgUrl = l.images && l.images.length > 0 ? l.images[0].url : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80";
              
              // Resolve absolute URL for images if it's a relative path
              if (!imgUrl.startsWith('http')) {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "https://property-management-system-production-e024.up.railway.app";
                // Ensure proper slashes
                const cleanImgUrl = imgUrl.replace(/\\/g, '/').replace(/^\//, '');
                imgUrl = `${apiBaseUrl}/${cleanImgUrl}`;
              }

              const priceStr = l.listingType === 'RENT' ? `$${l.price.toLocaleString()}/mo` : `$${l.price.toLocaleString()}`;
              
              return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group border border-transparent hover:border-border">
                {/* Thumbnail */}
                <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover"/>
                  <div className="absolute bottom-1 left-1 bg-background/80 backdrop-blur-sm text-foreground text-[9px] font-black px-1.5 py-0.5 rounded border border-border/50">
                    {l.listingType}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-black text-foreground leading-tight">{priceStr}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {l.Rooms || 0} bds · {l.Bathrooms || 0} ba · {l.area || 0} m²
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0"/> {l.city}
                  </p>
                </div>

                {/* Meta */}
                <div className="text-[11px] text-muted-foreground shrink-0 text-right space-y-1">
                  <p className="text-emerald-500 font-semibold">· Active {daysActive} days</p>
                  <p className="flex items-center gap-1 justify-end"><Eye className="w-3 h-3"/> 0 <span className="text-emerald-500">+0 today</span></p>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Efficiency leaderboard */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[16px] font-black text-foreground">Owner Efficiency</p>
            <div className="flex gap-2 text-[10px] font-bold text-muted-foreground">
              <button className="px-2 py-0.5 bg-foreground text-background rounded-md">$</button>
              <button className="px-2 py-0.5">%</button>
            </div>
          </div>

          <div className="space-y-5">
            {(stats.topOwners.length > 0 ? stats.topOwners : owners).map((o, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-2">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0">
                    {o.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <p className="text-[12px] font-semibold text-muted-foreground flex-1">{o.name}</p>
                  <p className="text-[12px] font-black text-foreground">{o.pct}%</p>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${o.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mini sparkline at bottom */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground font-semibold mb-2">Monthly trend</p>
            <Sparkline data={sparkA} fill/>
          </div>
        </div>

      </div>
    </div>
  )
}
