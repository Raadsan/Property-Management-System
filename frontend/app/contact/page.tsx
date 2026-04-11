"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen font-sans bg-[#f8f9fa]">
      <Navbar />

      {/* 1. Header Banner */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347]">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* 2. Main Contact Section */}
      <section className="py-16 md:py-24 relative z-20 -mt-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
           <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
              
              {/* Left Side: Contact Info Sidebar */}
              <div className="lg:w-2/5 bg-[#214347] p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
                 {/* Subtle decorative background circles */}
                 <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

                 <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-3 tracking-tight">Get in Touch</h3>
                    <p className="text-teal-50/80 text-[15px] mb-12 font-light leading-relaxed">
                       Fill out the form and our team will get back to you within 24 hours.
                    </p>

                    <div className="flex flex-col gap-8">
                       <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Phone
                          </span>
                          <span className="text-lg font-medium">+252 613052542 / 613055580</span>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Email
                          </span>
                          <span className="text-lg font-medium">imustaqbalproperties@gmail.com</span>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Office
                          </span>
                          <span className="text-lg font-medium leading-relaxed max-w-[200px]">
                            HQ Digfeer,<br/>Mogadishu, Somalia
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="relative z-10 pt-16 flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eae1d2] hover:text-[#214347] transition-all text-white">
                       <MessageSquare className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eae1d2] hover:text-[#214347] transition-all text-white">
                       <Clock className="h-4 w-4" />
                    </a>
                 </div>
              </div>

              {/* Right Side: Contact Form */}
              <div className="lg:w-3/5 p-8 md:p-12 lg:p-14 bg-white">
                 <form className="flex flex-col gap-7 text-gray-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">First Name</label>
                          <input 
                            type="text" 
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="John"
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Last Name</label>
                          <input 
                            type="text" 
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="Doe"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Email</label>
                          <input 
                            type="email" 
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="john@example.com"
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Phone</label>
                          <input 
                            type="tel" 
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="+252 61..."
                          />
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-2">
                       <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Inquiry Type</label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {["General", "Renting", "Buying", "Support"].map((subject) => (
                             <label key={subject} className="cursor-pointer">
                                <input type="radio" name="subject" className="peer sr-only" />
                                <div className="text-center px-2 py-2.5 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-500 peer-checked:bg-[#214347] peer-checked:text-white peer-checked:border-[#214347] hover:bg-gray-50 transition-all">
                                   {subject}
                                </div>
                             </label>
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                       <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Message</label>
                       <textarea 
                         rows={5} 
                         className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all resize-none text-[15px]"
                         placeholder="How can we help you?"
                       ></textarea>
                    </div>

                    <div className="pt-6">
                       <button type="button" className="bg-[#214347] text-white px-8 py-4 rounded-xl font-bold text-[15px] tracking-wide hover:bg-[#0d2326] transition-colors active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm">
                          Send Message <Send className="w-4 h-4 ml-1" />
                       </button>
                    </div>
                 </form>
              </div>

           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
