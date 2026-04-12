"use client";

import React from "react";
import { Apple } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-8 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-[#214347] rounded-[1.5rem] relative overflow-hidden shadow-xl border border-white/5">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 p-6 md:p-10 relative z-10">
            {/* Left Section: Text Content */}
            <div className="space-y-5 text-center lg:text-left order-2 lg:order-1">
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                  The <span className="text-[#eae1d2]">Damal App</span> <br />
                  In Your Pocket.
                </h2>
                <p className="text-white/70 text-xs md:text-sm max-w-sm mx-auto lg:mx-0 leading-relaxed font-medium">
                  Track properties, manage payments, and chat with tenants 
                  instantly. Experience Somalia's leading real estate platform.
                </p>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-1">
                <button className="h-9 px-4 bg-white text-black rounded-lg flex items-center gap-2.5 hover:bg-[#eae1d2] transition-colors shadow-lg group">
                   <Apple className="w-4 h-4" />
                   <div className="text-left leading-none">
                     <p className="text-[8px] uppercase font-bold opacity-40 mb-0.5">Download on</p>
                     <p className="text-[11px] font-black">App Store</p>
                   </div>
                </button>
                <button className="h-9 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg flex items-center gap-2.5 hover:bg-white hover:text-black transition-all shadow-lg group">
                   <svg viewBox="0 0 512 512" className="w-4 h-4 fill-current"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 58.9-34.1c18-10.4 18-27.4 0-36.3zM104.6 499l220.7-221.3 60.1 60.1L104.6 499z"/></svg>
                   <div className="text-left leading-none">
                     <p className="text-[8px] uppercase font-bold opacity-40 mb-0.5">Get it on</p>
                     <p className="text-[11px] font-black">Google Play</p>
                   </div>
                </button>
              </div>
            </div>

            {/* Right Section: Isometric Stacked Mockup (Rotated Right) */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 h-[195px] md:h-[255px] perspective-1000">
               <div className="relative w-full max-w-[240px] h-full flex items-center justify-center translate-x-0 md:translate-x-[-10%]">
                  {/* Background Screen 1 (Back) */}
                  <div className="absolute top-[5%] right-[40%] w-[100px] md:w-[130px] h-[150px] md:h-[200px] bg-[#2d5a5f] rounded-xl border border-white/10 shadow-2xl transform rotate-[15deg] translate-z-0 transition-transform duration-700 hover:rotate-[5deg] overflow-hidden opacity-60">
                     <div className="p-3 space-y-2">
                        <div className="w-1/2 h-3 bg-white/10 rounded-full"></div>
                        <div className="grid grid-cols-2 gap-1.5">
                           <div className="h-8 bg-white/5 rounded-md"></div>
                           <div className="h-8 bg-white/5 rounded-md"></div>
                        </div>
                        <div className="w-full h-12 bg-white/5 rounded-md"></div>
                     </div>
                  </div>

                  {/* Middle Screen 2 */}
                  <div className="absolute top-[12%] right-[22%] w-[100px] md:w-[130px] h-[150px] md:h-[200px] bg-[#1a383b] rounded-xl border border-white/10 shadow-2xl transform rotate-[10deg] translate-z-10 transition-transform duration-700 hover:rotate-[2deg] overflow-hidden opacity-90">
                     <div className="p-3 space-y-2">
                        <div className="w-2/3 h-4 bg-[#eae1d2]/20 rounded-full"></div>
                        <div className="flex gap-2">
                           <div className="w-6 h-6 rounded-full bg-white/10"></div>
                           <div className="flex-grow space-y-1">
                              <div className="w-full h-1.5 bg-white/10 rounded-full"></div>
                              <div className="w-2/3 h-1.5 bg-white/5 rounded-full"></div>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 pt-1">
                           {[1,2,3,4,5,6].map(i => <div key={i} className="h-6 bg-white/5 rounded-sm"></div>)}
                        </div>
                     </div>
                  </div>

                  {/* Front Screen 3 (Dashboard focus) */}
                  <div className="absolute top-[19%] right-[5%] w-[100px] md:w-[130px] h-[150px] md:h-[200px] bg-white rounded-xl border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transform rotate-[5deg] translate-z-20 transition-transform duration-700 hover:rotate-0 overflow-hidden">
                     <div className="p-3 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2">
                           <div className="w-6 h-6 rounded-md bg-[#214347]/10"></div>
                           <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full mb-2"></div>
                        <div className="flex gap-2 mb-3">
                           <div className="w-9 h-9 rounded-full border-[3px] border-[#214347] flex items-center justify-center text-[8px] font-bold">58%</div>
                           <div className="flex-grow flex flex-col justify-center space-y-1">
                              <div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
                              <div className="w-2/3 h-1.5 bg-gray-100 rounded-full"></div>
                           </div>
                        </div>
                        {/* Bar chart mockup */}
                        <div className="flex-grow flex items-end gap-1 px-0.5">
                           {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                              <div key={i} style={{ height: `${h}%` }} className="flex-grow bg-[#214347]/10 rounded-t-xs"></div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Ground Shadow/Reflection */}
               <div className="absolute bottom-2 right-12 w-[100px] h-2 bg-black/10 blur-xl rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
         .perspective-1000 { perspective: 1000px; }
         .translate-z-0 { transform: translateZ(0); }
         .translate-z-10 { transform: translateZ(50px); }
         .translate-z-20 { transform: translateZ(100px); }
      `}</style>
    </section>
  );
}
