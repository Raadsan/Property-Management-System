"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PropertyCard from "@/components/landing/PropertyCard";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useState } from "react";

const rentProperties = [
  {
    id: 1,
    title: "waaberi-mall",
    price: "$125,100/mo",
    category: "Mall",
    location: "Hodan, Mogadishu, Banaadir",
    floors: 7,
    sqrm: "20x20",
    units: 5,
    tag: "For Rent",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "golden-gate-plaza",
    price: "$125,100/mo",
    category: "Hotel",
    location: "Howlwadaag, Mogadishu, Banaadir",
    floors: 5,
    sqrm: "20x22",
    units: 1,
    tag: "For Rent",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "City View Apartment",
    price: "$800/mo",
    category: "Apartment",
    location: "Afgooye Road, Mogadishu",
    floors: 1,
    sqrm: "12x12",
    tag: "For Rent",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Modern Office Suite",
    price: "$2,500/mo",
    category: "Office space",
    location: "Airport Road, Mogadishu",
    floors: 1,
    sqrm: "20x20",
    tag: "For Rent",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Beachside Guesthouse",
    price: "$1,200/mo",
    category: "Guesthouse",
    location: "Lido Beach, Mogadishu",
    floors: 2,
    sqrm: "15x20",
    tag: "For Rent",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Commercial Warehouse",
    price: "$3,000/mo",
    category: "Warehouse",
    location: "KM4, Mogadishu",
    floors: 1,
    sqrm: "40x100",
    tag: "For Rent",
    image: "https://images.unsplash.com/photo-1586528116311-ad86694e9f73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

export default function RentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Properties For Rent</h1>
           <p className="text-white/80 text-lg max-w-xl mx-auto">Looking for a rental? Explore our premium listings across the most vibrant neighborhoods.</p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-20 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
           {/* Categories Horizontal Pills (Like second image) */}
           <div className="flex overflow-x-auto gap-3 pb-2 pt-1 hide-scrollbar">
             {[
               "All Categories",
               "Mall",
               "Apartment",
               "Villa",
               "Office space",
               "Business center",
               "Warehouse",
               "Hotel",
               "DHUL BEEC AH",
               "dukan-electronic iib ah",
               "dukan-electronic Kiro ah",     
             ].map((cat) => (
                <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`flex-shrink-0 px-5 py-2.5 rounded-[12px] border font-semibold text-[14px] transition-all whitespace-nowrap ${
                      selectedCategory === cat 
                        ? "bg-[#214347] text-white border-[#214347] shadow-md shadow-[#214347]/20 tracking-wide" 
                        : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                   }`}
                >
                   {cat}
                </button>
             ))}
           </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rentProperties
              .filter(p => {
                const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === "All Categories" || p.category.toLowerCase() === selectedCategory.toLowerCase();
                return matchesSearch && matchesCategory;
              })
              .map((prop) => (
                <PropertyCard key={prop.id} prop={prop} />
            ))}
          </div>

          {rentProperties.filter(p => {
             const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
             const matchesCategory = selectedCategory === "All Categories" || p.category.toLowerCase() === selectedCategory.toLowerCase();
             return matchesSearch && matchesCategory;
          }).length === 0 && (
             <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mt-8">
                <p className="text-gray-500 text-lg font-medium">No rentals found matching your criteria.</p>
             </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
