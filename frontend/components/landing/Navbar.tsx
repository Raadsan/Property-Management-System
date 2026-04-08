"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Home as HomeIcon, Key } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { 
      name: "Property", 
      dropdown: [
        { name: "Buy Property", href: "/buy", icon: HomeIcon },
        { name: "Rent Property", href: "/rent", icon: Key }
      ]
    },
    { name: "Contact", href: "/contact" },
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
              return (
                <div key={link.name} className="relative group">
                  <button className="flex items-center gap-1 text-gray-700 font-semibold hover:text-[#214347] transition-all text-[15px]">
                    {link.name}
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#214347] transition-colors" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-[120%] left-0 w-[210px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 group-hover:top-full z-50 overflow-hidden">
                    <div className="flex flex-col py-3">
                      {link.dropdown.map((sublink, idx) => {
                        const Icon = sublink.icon;
                        return (
                          <div key={sublink.name} className="relative group/item">
                            <Link
                              href={sublink.href}
                              className="flex items-center gap-3.5 px-6 py-3.5 text-gray-700 hover:text-[#214347] hover:bg-gray-50 transition-colors font-medium text-[15px]"
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

            return (
              <Link
                key={link.name}
                href={link.href!}
                className="text-gray-700 font-semibold hover:text-[#214347] transition-colors text-[15px]"
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Login Button */}
        <div className="hidden md:block">
          <Link
            href="/login"
            className="bg-[#1e3a3a] text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-[#0d2326] transition-all active:scale-95"
          >
            Log in
          </Link>
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
            
            <Link
              href="/login"
              className="bg-[#1e3a3a] text-white text-center py-4 rounded-full font-bold mt-8 text-sm shadow-md"
              onClick={() => setIsOpen(false)}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
