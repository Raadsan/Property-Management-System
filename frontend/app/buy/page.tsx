"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PropertyCard from "@/components/landing/PropertyCard";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useState } from "react";

const buyProperties = [
  {
    id: 1,
    title: "Luxury Beach Villa",
    price: "$850,000",
    category: "Villa",
    location: "Kismayo Coast, Lower Juba",
    floors: 3,
    sqrm: "40x50",
    tag: "For Sale",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Modern Apartment Suite",
    price: "$220,000",
    category: "Apartment",
    location: "Maka Almukarama, Mogadishu",
    floors: 1,
    sqrm: "15x15",
    tag: "For Sale",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Downtown Commercial Space",
    price: "$450,000",
    category: "Office space",
    location: "Hodan District, Mogadishu",
    floors: 2,
    sqrm: "20x30",
    tag: "For Sale",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Elite Penthouse",
    price: "$550,000",
    category: "Penthouse",
    location: "Hargeisa Central, Somaliland",
    floors: 1,
    sqrm: "25x25",
    tag: "For Sale",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Prime Land Plot",
    price: "$120,000",
    category: "DHUL BEEC AH",
    location: "Garowe Expansion Area",
    floors: 0,
    sqrm: "50x100",
    tag: "For Sale",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Family Suburban Home",
    price: "$310,000",
    category: "House",
    location: "Daynile, Mogadishu",
    floors: 2,
    sqrm: "20x25",
    tag: "For Sale",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

export default function BuyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Properties For Sale</h1>
           <p className="text-white/80 text-lg max-w-xl mx-auto">Browse our elite selection of properties available for purchase across the region.</p>
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
            {buyProperties
              .filter(p => {
                const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === "All Categories" || p.category.toLowerCase() === selectedCategory.toLowerCase();
                return matchesSearch && matchesCategory;
              })
              .map((prop) => (
                <PropertyCard key={prop.id} prop={prop} />
            ))}
          </div>

          {buyProperties.filter(p => {
             const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
             const matchesCategory = selectedCategory === "All Categories" || p.category.toLowerCase() === selectedCategory.toLowerCase();
             return matchesSearch && matchesCategory;
          }).length === 0 && (
             <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mt-8">
                <p className="text-gray-500 text-lg font-medium">No properties found matching your criteria.</p>
             </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
