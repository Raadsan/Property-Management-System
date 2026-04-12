"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, ChevronDown, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCityStats, getPropertyTypes } from "@/api/propertyApi";

const PRICE_RANGES = [
  { label: "$0 - $1,000", min: 0, max: 1000 },
  { label: "$1,000 - $5,000", min: 1000, max: 5000 },
  { label: "$5,000 - $20,000", min: 5000, max: 20000 },
  { label: "$20,000+", min: 20000, max: null },
];

export default function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all"); // all, rent, sale
  
  // Selection States
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState<any>(null);

  // Data States
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States (Dropdowns)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityData, typeData] = await Promise.all([
          getCityStats(),
          getPropertyTypes()
        ]);
        setCities(cityData.map(c => c.name));
        setTypes(typeData);
      } catch (error) {
        console.error("Hero data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Close dropdowns on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSearch = () => {
    let query = `/explore?`;
    if (activeTab !== "all") {
      query += `listingType=${activeTab.toUpperCase()}&`;
    }
    
    if (selectedCity) query += `city=${encodeURIComponent(selectedCity)}&`;
    if (selectedType) query += `type=${encodeURIComponent(selectedType)}&`;
    if (selectedPrice) {
      const range = PRICE_RANGES.find(r => r.label === selectedPrice);
      if (range) {
        query += `minPrice=${range.min}&`;
        if (range.max) query += `maxPrice=${range.max}&`;
      }
    }
    
    // Remove trailing & or ?
    query = query.replace(/[&?]$/, "");
    router.push(query);
  };

  return (
    <section id="home" className="relative w-full h-[800px] bg-white">
      {/* Background Image Container - strictly 800px */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src="/hero.jpeg"
          alt="Luxury Real Estate"
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Text Content - Centered in the 800px height */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            Find Your Perfect <br />
            Home in Somalia
          </h1>
          <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
            Browse hundreds of verified properties — apartments, villas &amp; commercial spaces tailored to your lifestyle and budget.
          </p>
        </div>
      </div>

      {/* Search Bar - Positioned HALF-BETWEEN Hero and the section below */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-7xl px-4 z-40" ref={dropdownRef}>
        
        {/* Tabs */}
        <div className="flex">
          {["all", "rent", "sale"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-4 text-sm font-bold uppercase tracking-widest rounded-t-3xl transition-all ${
                activeTab === tab
                  ? "bg-white text-[#214347]"
                  : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border-t border-x border-white/20"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Search Pill */}
        <div className="bg-white rounded-b-[2.5rem] rounded-tr-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-3 flex flex-col md:flex-row items-center gap-2 border border-gray-100">
          
          <div className="flex-1 w-full border-r border-gray-100 last:border-0 relative">
            <div 
              onClick={() => toggleDropdown("city")}
              className="px-8 py-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group relative"
            >
              <span className="text-[11px] font-bold text-black uppercase tracking-wider mb-1 block">Location</span>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${selectedCity ? "text-gray-900" : "text-gray-400"}`}>
                  {selectedCity || "Select Your City"}
                </span>
                <MapPin className="h-4 w-4 text-[#214347]" />
              </div>
            </div>

            {/* Custom Styled Dropdown */}
            {openDropdown === "city" && (
              <div className="absolute top-[105%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div 
                  onClick={() => { setSelectedCity(""); setOpenDropdown(null); }}
                  className={`px-6 py-2.5 text-sm font-medium cursor-pointer hover:bg-gray-50 ${!selectedCity ? "bg-[#214347] text-white" : "text-gray-500"}`}
                >
                  Select Your City
                </div>
                {cities.map(city => (
                  <div 
                    key={city} 
                    onClick={() => { setSelectedCity(city); setOpenDropdown(null); }}
                    className={`px-6 py-3 flex items-center justify-between cursor-pointer group transition-colors ${
                      selectedCity === city 
                        ? "bg-[#214347] text-white" 
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-bold">{city}</span>
                    {selectedCity === city && <Check className="h-4 w-4 text-white" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 w-full border-r border-gray-100 last:border-0 relative">
             <div 
               onClick={() => toggleDropdown("type")}
               className="px-8 py-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group relative"
             >
              <span className="text-[11px] font-bold text-black uppercase tracking-wider mb-1 block">Property Type</span>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${selectedType ? "text-gray-900" : "text-gray-400"}`}>
                  {selectedType || "Choose Property Type"}
                </span>
                <ChevronDown className="h-4 w-4 text-[#214347]" />
              </div>
            </div>

            {openDropdown === "type" && (
              <div className="absolute top-[105%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div 
                  onClick={() => { setSelectedType(""); setOpenDropdown(null); }}
                  className={`px-6 py-2.5 text-sm font-medium cursor-pointer hover:bg-gray-50 ${!selectedType ? "bg-[#214347] text-white" : "text-gray-500"}`}
                >
                  Choose Property Type
                </div>
                {types.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => { setSelectedType(t.name); setOpenDropdown(null); }}
                    className={`px-6 py-3 flex items-center justify-between cursor-pointer group transition-colors ${
                      selectedType === t.name 
                        ? "bg-[#214347] text-white" 
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-bold">{t.name}</span>
                    {selectedType === t.name && <Check className="h-4 w-4 text-white" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 w-full border-r border-gray-100 last:border-0 relative">
             <div 
               onClick={() => toggleDropdown("price")}
               className="px-8 py-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group relative"
             >
              <span className="text-[11px] font-bold text-black uppercase tracking-wider mb-1 block">Price Range</span>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${selectedPrice ? "text-gray-900" : "text-gray-400"}`}>
                  {selectedPrice || "Choose Price Range"}
                </span>
                <ChevronDown className="h-4 w-4 text-[#214347]" />
              </div>
            </div>

            {openDropdown === "price" && (
              <div className="absolute top-[105%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                <div 
                  onClick={() => { setSelectedPrice(""); setOpenDropdown(null); }}
                  className={`px-6 py-2.5 text-sm font-medium cursor-pointer hover:bg-gray-50 ${!selectedPrice ? "bg-[#214347] text-white" : "text-gray-500"}`}
                >
                  Choose Price Range
                </div>
                {PRICE_RANGES.map(r => (
                  <div 
                    key={r.label} 
                    onClick={() => { setSelectedPrice(r.label); setOpenDropdown(null); }}
                    className={`px-6 py-3 flex items-center justify-between cursor-pointer group transition-colors ${
                      selectedPrice === r.label 
                        ? "bg-[#214347] text-white" 
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-bold">{r.label}</span>
                    {selectedPrice === r.label && <Check className="h-4 w-4 text-white" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4">
            <button 
              onClick={handleSearch}
              className="bg-[#214347] hover:bg-[#1a3539] text-white h-16 w-16 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center group"
            >
              <Search className="h-6 w-6 group-hover:scale-110 transition-transform" strokeWidth={3} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
