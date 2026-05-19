"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronDown, LogOut } from "lucide-react"

export function SiteHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Failed to parse user from localStorage")
      }
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 flex h-[74px] shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {user ? (user.role?.name || 'Staff') : 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-4 relative">
          <ModeToggle />

          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-white dark:bg-[#0c1425] border border-gray-200 dark:border-gray-800 text-[#214347] dark:text-white px-5 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-gray-50 dark:hover:bg-[#121c33] transition-all active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#214347] text-white flex items-center justify-center font-black text-[10px]">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 opacity-70 transition-transform text-[#214347] dark:text-white" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {dropdownOpen && (
                <>
                  {/* Click outside overlay */}
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-[220px] bg-white dark:bg-[#0c1425] border border-gray-150 dark:border-gray-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-2.5 border-b border-gray-50 dark:border-gray-800">
                      <p className="font-extrabold text-gray-900 dark:text-white text-sm truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-400 font-medium truncate mt-0.5">{user.email}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider">
                        {user.role?.name || 'Staff'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-5 py-3 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-[13.5px] font-bold text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
