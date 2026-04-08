"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  MapPin, 
  Star,
  BedDouble,
  Bath,
  Home,
  Wind,
  ChefHat,
  Container,
  Wifi,
  Car,
  User
} from "lucide-react";

const propertyData = {
  id: 1,
  title: "Veloura Residences",
  price: "$4050",
  location: "Miami, Florida, celinam delware 2098",
  description: "Discover this modern 3-bedroom apartment located in the heart of the city, offering a perfect blend of comfort and convenience. Enjoy breathtaking skyline views, an open-concept kitchen, spacious living areas, and a private balcony ideal for relaxing evenings.",
  images: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=60",
    "https://images.unsplash.com/photo-1600607687937-3004d496035c?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=60",
  ]
};

export default function PropertyDetailPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-gray-100">
      <Navbar />

      <div className="max-w-[1300px] mx-auto px-6 pt-32 pb-20">
        
        {/* Gallery Section - Adjusted to 4-column grid for narrower right stack */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px] md:h-[600px] mb-10 overflow-hidden">
          <div className="md:col-span-3 h-full bg-gray-100 rounded-2xl">
            <img 
              src={propertyData.images[0]} 
              className="w-full h-full object-cover rounded-2xl shadow-sm" 
              alt="Luxury Villa Exterior" 
            />
          </div>
          <div className="md:col-span-1 grid grid-rows-3 gap-4 h-full">
            <div className="h-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-50">
              <img src={propertyData.images[1]} className="w-full h-full object-cover" alt="Modern Interior Space" />
            </div>
            <div className="h-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-50">
              <img src={propertyData.images[2]} className="w-full h-full object-cover" alt="Contemporary Kitchen Detail" />
            </div>
            <div className="relative h-full overflow-hidden rounded-2xl bg-black shadow-inner">
              <img src={propertyData.images[3]} className="w-full h-full object-cover opacity-60" alt="Master Suite View" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-5xl font-semibold drop-shadow-lg">7+</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Header & Description (Full Width) */}
        <div className="mb-12">
          {/* Header */}
          <div className="mb-8 p-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{propertyData.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-y-4 gap-x-12">
              <div className="flex items-center gap-6 text-[14px] text-gray-500 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{propertyData.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-black">5.0</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 border-l border-gray-100 md:pl-12">
                <span className="text-4xl font-bold text-gray-900 tracking-tighter">{propertyData.price}</span>
                <span className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">USD</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-4xl">
            <h4 className="text-[15px] font-bold text-gray-900 mb-3">Description:</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed font-light">
              {propertyData.description}
            </p>
          </div>
        </div>

        {/* 2. Key Features & Quick Actions (Aligned Row) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Amenities (Left - 2/3) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-[15px] font-bold text-gray-900 mb-4">Key Features:</h4>
            <div className="border border-gray-100 rounded-[24px] p-10 bg-white shadow-sm flex-grow">
              <h5 className="text-[17px] font-bold text-gray-900 mb-9">Amenities</h5>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
                {[
                  { icon: <BedDouble />, label: "2 Beds" },
                  { icon: <Bath />, label: "3 Baths" },
                  { icon: <Home />, label: "10k sq ft" },
                  { icon: <Wind />, label: "Smocking Area" },
                  { icon: <ChefHat />, label: "Kitchen" },
                  { icon: <Container />, label: "balcony" },
                  { icon: <Wifi />, label: "Wifi" },
                  { icon: <Car />, label: "Parking Area" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <div className="text-gray-300 group-hover:text-[#0a74b3] transition-colors">
                      {React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5 stroke-[1.5]" })}
                    </div>
                    <span className="text-[13px] font-semibold text-gray-800">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions (Right - 1/3) */}
          <div className="lg:col-span-1 flex flex-col">
            <h4 className="text-[15px] font-bold text-white mb-4 select-none lg:block hidden">_</h4>
            <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex flex-col h-full justify-between">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h4>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center gap-4 bg-[#0a74b3] text-white py-5 rounded-2xl font-bold hover:bg-[#086298] transition-all text-sm uppercase tracking-widest active:scale-[0.98]">
                    <User className="h-5 w-5" /> Login to Book
                  </button>
                  <button className="w-full flex items-center justify-center gap-4 bg-[#26ce61] text-white py-5 rounded-2xl font-bold hover:bg-[#20b453] transition-all text-sm uppercase tracking-widest active:scale-[0.98]">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg> WhatsApp
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Typically responds <br className="lg:hidden" /> within 1 hour</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
