"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Home as HomeIcon, Key, LayoutDashboard, User, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  const isRegularUser = 
    user && (
      user.role?.name?.toLowerCase() === "user" || 
      user.role?.name?.toLowerCase() === "client" || 
      user.roleId === 3
    );

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Explore", href: "/explore" },
    { 
      name: "Property", 
      dropdown: [
        { name: "Buy Property", href: "/buy", icon: HomeIcon },
        { name: "Rent Property", href: "/rent", icon: Key }
      ]
    },  
    { name: "Blogs", href: "/blogs" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-4 px-6">
      {/* Floating Pill Container */}
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-white/60 px-4 md:px-8 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/#home" className="flex items-center shrink-0">
          <img src="/logo.png" alt="Damal Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav - Centered */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => {
            if (link.dropdown) {
              const isSubActive = link.dropdown.some(sub => pathname === sub.href);
              return (
                <div key={link.name} className="relative group">
                  <button className={`flex items-center gap-1 font-semibold transition-all text-[15px] ${
                    isSubActive ? "text-[#214347]" : "text-gray-700 hover:text-[#214347]"
                  }`}>
                    {link.name}
                    <ChevronDown className={`w-4 h-4 transition-colors ${
                      isSubActive ? "text-[#214347]" : "text-gray-400 group-hover:text-[#214347]"
                    }`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-[120%] left-0 w-[210px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 group-hover:top-full z-50 overflow-hidden">
                    <div className="flex flex-col py-3">
                      {link.dropdown.map((sublink, idx) => {
                        const Icon = sublink.icon;
                        const isSubLinkActive = pathname === sublink.href;
                        return (
                          <div key={sublink.name} className="relative group/item">
                            <Link
                              href={sublink.href}
                              className={`flex items-center gap-3.5 px-6 py-3.5 transition-colors font-medium text-[15px] ${
                                isSubLinkActive ? "text-[#214347] bg-gray-50" : "text-gray-700 hover:text-[#214347] hover:bg-gray-50"
                              }`}
                            >
                              {Icon && <Icon className="w-[18px] h-[18px] text-[#214347]" strokeWidth={2} />}
                              {sublink.name}
                            </Link>

                            {/* Divider */}
                            {idx !== link.dropdown.length - 1 && (
                              <div className="mx-6 border-b border-dashed border-gray-100"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href!}
                className={`relative py-1 text-[15px] font-semibold transition-colors ${
                  isActive ? "text-[#214347]" : "text-gray-700 hover:text-[#214347]"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#214347] rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Button / Profile Dropdown */}
        <div className="hidden md:block relative">
          {user ? (
            isRegularUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-gray-50 border border-gray-150 text-[#214347] px-5 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#214347] text-white flex items-center justify-center font-black text-[10px]">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[120px] truncate"> {user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 opacity-70 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-5 py-2.5 border-b border-gray-50">
                        <p className="font-extrabold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{user.email}</p>
                        {/* <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                          Client / User
                        </span> */}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-5 py-3 text-red-500 hover:bg-red-50/50 text-[13.5px] font-bold text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4.5 h-4.5" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/dashboard"
                className="bg-[#214347] text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-[#163033] transition-all active:scale-95 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )
          ) : (
            <Link
              href="/login"
              className="bg-[#1e3a3a] text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-[#0d2326] transition-all active:scale-95"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="text-[#214347]" /> : <Menu className="text-[#214347]" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl mt-2 mx-4 rounded-3xl shadow-2xl border border-white/60 py-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col px-6">
            <div className="flex flex-col space-y-2 font-semibold">
              {navLinks.map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.name} className="flex flex-col">
                      <button 
                        onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                        className="flex items-center justify-between py-3 text-gray-800 hover:text-[#214347] text-lg border-b border-gray-50 text-left w-full"
                      >
                        {link.name}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`flex flex-col pl-2 overflow-hidden transition-all duration-300 ${mobileDropdownOpen ? 'max-h-48 py-2' : 'max-h-0'}`}>
                        {link.dropdown.map((sublink, idx) => {
                           const Icon = sublink.icon;
                           return (
                              <Link
                                key={sublink.name}
                                href={sublink.href}
                                className={`flex items-center gap-3 py-3 text-gray-600 hover:text-[#214347] text-[16px] font-medium ${
                                  idx !== link.dropdown.length - 1 ? 'border-b border-dashed border-gray-100' : ''
                                }`}
                                onClick={() => setIsOpen(false)}
                              >
                                {Icon && <Icon className="w-[18px] h-[18px] text-[#214347]" strokeWidth={2} />}
                                {sublink.name}
                              </Link>
                           );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href!}
                    className="py-3 text-gray-800 hover:text-[#214347] text-lg border-b border-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            {user ? (
              isRegularUser ? (
                <div className="flex flex-col gap-2 mt-8">
                  <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#214347] text-white flex items-center justify-center font-black text-sm">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-900 text-sm">{user.name}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white text-center py-4 rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="bg-[#214347] text-white text-center py-4 rounded-full font-bold mt-8 text-sm shadow-md flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              )
            ) : (
              <Link
                href="/login"
                className="bg-[#1e3a3a] text-white text-center py-4 rounded-full font-bold mt-8 text-sm shadow-md"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
