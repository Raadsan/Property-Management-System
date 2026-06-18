"use client";

import React from "react";
import { Building2, ShieldCheck, TrendingUp, LayoutDashboard, Headset, MapPin, Eye, Sprout, Handshake } from "lucide-react";

const features = [
  { 
    icon: Building2, 
    title: "All Your Property Needs in One Place ", 
    desc: "Whether you are searching for a home, apartment, hotel, event hall, or investment opportunity, Damal brings everything together on a single platform, making property discovery simple, efficient, and convenient. " 
  },
  { 
    icon: ShieldCheck, 
    title: "Verified & Trusted Listings", 
    desc: "We prioritize quality and credibility. Our verification process helps ensure that users can browse genuine properties with confidence, creating a trusted marketplace for everyone involved. " 
  },
  { 
    icon: TrendingUp, 
    title: "Faster Occupancy, Greater Visibility ", 
    desc: "Property owners gain access to a wider audience through Damal’s powerful marketing and discovery tools, helping them attract qualified tenants, guests, and customers more efficiently. " 
  },
  { 
    icon: LayoutDashboard, 
    title: "Smart Owner Dashboard ", 
    desc: "Our intuitive landlord and property management portal provides owners with a centralized view of their listings, bookings, occupancy performance, and customer interactions, enabling smarter decision-making. " 
  },
  { 
    icon: Headset, 
    title: "Dedicated Customer Support ", 
    desc: "Our professional support team is available to assist users throughout their journey, ensuring a smooth experience from property search to successful booking. " 
  },
  { 
    icon: MapPin, 
    title: "Deep Local Market Knowledge ", 
    desc: "Built by people who understand Somalia's real estate landscape, Damal combines local expertise with modern technology to deliver solutions tailored to the needs of communities, property owners, and businesses." 
  },
  { 
    icon: Eye, 
    title: "Transparent & Reliable Experience ", 
    desc: "Clear information, accurate property details, and straightforward processes help users make informed decisions while building long-term trust within the marketplace. " 
  },
  { 
    icon: Sprout, 
    title: "Built for Growth", 
    desc: "Damal is designed to grow alongside Somalia’s rapidly evolving real estate and hospitality sectors. Our platform continuously evolves to provide innovative solutions that create value for both customers and property owners. " 
  },
  { 
    icon: Handshake, 
    title: "The Damal Promise  ", 
    desc: "Whether you are looking for your next home, promoting a property, booking accommodation, or exploring opportunities, Damal provides the platform, technology, and support to help you succeed. " 
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
           Damal is transforming how people discover, book, rent, and manage properties across Somalia. Inspired by the Damal Tree—a symbol of trust, shelter, and community—we provide a modern digital platform that connects property owners, tenants, travelers, and businesses through a seamless and reliable experience.
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
