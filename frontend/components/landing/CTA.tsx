"use client";

import React from "react";
import { Apple } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-8 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-[#214347] bg-gradient-to-br from-[#214347] to-[#1a383b] rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-white/5">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#eae1d2]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 p-8 md:p-14 relative z-10">
            {/* Left Section: Text Content */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-black text-white leading-[1.1]"
                >
                  The <span className="text-[#eae1d2]">Damal App</span> <br />
                  In Your Pocket.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-white/70 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                >
                  Track properties, manage payments, and chat with tenants instantly. <br className="hidden md:block" />
                  Experience Somalia's leading real estate platform.
                </motion.p>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 px-6 bg-white text-black rounded-xl flex items-center gap-3 hover:bg-[#eae1d2] transition-colors shadow-xl group"
                >
                  <Apple className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left leading-none">
                    <p className="text-[9px] uppercase font-bold opacity-40 mb-0.5 tracking-wider">Download on</p>
                    <p className="text-[13px] font-black">App Store</p>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 px-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl flex items-center gap-3 hover:bg-white hover:text-black transition-all shadow-xl group"
                >
                  <svg viewBox="0 0 512 512" className="w-5 h-5 fill-current flex-shrink-0"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 58.9-34.1c18-10.4 18-27.4 0-36.3zM104.6 499l220.7-221.3 60.1 60.1L104.6 499z" /></svg>
                  <div className="text-left leading-none">
                    <p className="text-[9px] uppercase font-bold opacity-40 mb-0.5 tracking-wider">Get it on</p>
                    <p className="text-[13px] font-black">Google Play</p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Right Section: Mobile Mockup Image */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 h-[180px] md:h-[240px]">
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: 5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-w-[220px] h-full flex items-center justify-center"
              >
                {/* Glowing background behind image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-[60px] rounded-full pointer-events-none"></div>

                <motion.img
                  // src="/Mobile-Mockup.png"
                  src="/Damal-App.png"
                  alt="Damal Mobile App Mockup"
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
