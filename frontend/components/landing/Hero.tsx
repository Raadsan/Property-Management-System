"use client";

import { Search, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("rent");

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
            Home in Mogadishu
          </h1>
          <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
            Browse hundreds of verified properties — apartments, villas &amp; commercial spaces tailored to your lifestyle and budget.
          </p>
        </div>
      </div>

      {/* Search Bar - Positioned HALF-BETWEEN Hero and the section below */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-7xl px-4 z-20">
        
        {/* Tabs */}
        <div className="flex">
          {["rent", "buy", "sell"].map((tab) => (
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
          
          <div className="flex-1 w-full border-r border-gray-100 last:border-0">
            <div className="px-8 py-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Location</span>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-semibold text-sm">Select Your City</span>
                <MapPin className="h-4 w-4 text-[#214347]" />
              </div>
            </div>
          </div>

          <div className="flex-1 w-full border-r border-gray-100 last:border-0">
             <div className="px-8 py-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Property Type</span>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-semibold text-sm">Choose Property Type</span>
                <ChevronDown className="h-4 w-4 text-[#214347]" />
              </div>
            </div>
          </div>

          <div className="flex-1 w-full border-r border-gray-100 last:border-0">
             <div className="px-8 py-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Price Range</span>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-semibold text-sm">Choose Price Range</span>
                <ChevronDown className="h-4 w-4 text-[#214347]" />
              </div>
            </div>
          </div>

          <div className="px-4">
            <button className="bg-[#214347] hover:bg-[#1a3539] text-white h-16 w-16 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center group">
              <Search className="h-6 w-6 group-hover:scale-110 transition-transform" strokeWidth={3} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
