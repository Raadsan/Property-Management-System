"use client";

import React from "react";
import { Headset, Zap, ShieldCheck, Map, LayoutDashboard, DollarSign } from "lucide-react";

const features = [
  { 
    icon: Headset, 
    title: "24/7 Property Support", 
    desc: "Our dedicated team is always available to handle tenant emergencies and maintenance requests." 
  },
  { 
    icon: Zap, 
    title: "Fast Tenant Placement", 
    desc: "We aggressively market your property to quickly secure reliable, thoroughly-vetted tenants." 
  },
  { 
    icon: ShieldCheck, 
    title: "Secure Transactions", 
    desc: "Bank-grade encryption ensures all your rent payments, deposits, and financial data stay protected." 
  },
  { 
    icon: Map, 
    title: "Deep Local Expertise", 
    desc: "With extensive roots in Mogadishu, we understand the local real estate market meticulously." 
  },
  { 
    icon: LayoutDashboard, 
    title: "Smart Landlord Portal", 
    desc: "Access your centralized dashboard to monitor rent, occupancy rates, and repair statuses." 
  },
  { 
    icon: DollarSign, 
    title: "Transparent Pricing", 
    desc: "No hidden fees. Experience full financial clarity with our competitive and straightforward rates." 
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
             Why Choose <span className="text-[#214347]">Damal Property?</span>
           </h2>
           <p className="text-gray-500 text-[1.1rem] max-w-2xl mx-auto">
             We provide everything you need to manage your property online and thriving.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-10 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#214347]/5 hover:-translate-y-1 transition-all duration-300">
                 <div className="w-[60px] h-[60px] rounded-full bg-teal-50 flex items-center justify-center mb-6 transition-colors">
                    <feature.icon className="h-[26px] w-[26px] text-[#214347]" strokeWidth={1.5} />
                 </div>
                 <h4 className="text-[1.15rem] font-bold text-gray-900 mb-4">{feature.title}</h4>
                 <p className="text-gray-500 leading-relaxed text-[0.95rem]">
                    {feature.desc}
                 </p>
              </div>
           ))}
        </div>
      </div>
    </section>
  );
}
