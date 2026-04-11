"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PropertyCard from "@/components/landing/PropertyCard";
import { getProperties, Property } from "@/api/propertyApi";
import { Search, SlidersHorizontal, MapPin, Loader2, Home } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "";
  const initialType = searchParams.get("type") || "";
  const initialListingType = searchParams.get("listingType") || "";
  const initialMinPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null;
  const initialMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null;

  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState(initialCity);
  const [selectedType, setSelectedType] = React.useState(initialType);
  const [selectedListingType, setSelectedListingType] = React.useState(initialListingType);

  React.useEffect(() => {
    const fetchProps = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        console.error("Failed to load properties:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProps();
  }, []);

  // Filter Logic
  const filteredProperties = properties.filter((p) => {
    const matchesCity = !selectedCity || p.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = !searchTerm || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || p.propertyType?.name.toLowerCase() === selectedType.toLowerCase();
    const matchesListingType = !selectedListingType || p.listingType.toUpperCase() === selectedListingType.toUpperCase();
    
    let matchesPrice = true;
    if (initialMinPrice !== null && p.price < initialMinPrice) matchesPrice = false;
    if (initialMaxPrice !== null && p.price > initialMaxPrice) matchesPrice = false;

    return matchesCity && matchesSearch && matchesType && matchesListingType && matchesPrice;
  });

  // Get unique cities for the filter dropdown/pills
  const uniqueCities = Array.from(new Set(properties.map(p => p.city))).filter(Boolean);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* 1. Header Banner (Styled like Contact Us) */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347]">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {selectedCity ? (
              <>Properties in <span className="text-[#eae1d2]">{selectedCity}</span></>
            ) : (
              <>Explore <span className="text-[#eae1d2]">Properties</span></>
            )}
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            {selectedCity 
              ? `Discover the best property management options and verified listings available across ${selectedCity}.`
              : "Discover the best property management options and listings across the most vibrant cities in the region."
            }
          </p>
        </div>
      </section>

      {/* 2. Interactive Search & Filter Bar */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-20 z-40 shadow-sm backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6">
            
            {/* Search Input Row */}
            <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-sm group focus-within:ring-2 focus-within:ring-[#214347]/10 transition-all">
               <div className="pl-4">
                 <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#214347] transition-colors" />
               </div>
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search by title, location or neighborhood..."
                 className="flex-1 py-3 px-3 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400"
               />
               <div className="pr-1.5 hidden sm:block">
                  <div className="bg-[#214347]/5 text-[#214347] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                     {filteredProperties.length} Results
                  </div>
               </div>
            </div>

            {/* City Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setSelectedCity("")}
                className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all border ${
                  !selectedCity 
                    ? "bg-[#214347] text-white border-[#214347] shadow-md shadow-[#214347]/20" 
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                All Cities
              </button>
              {uniqueCities.map(city => (
                <button 
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all border ${
                    selectedCity === city 
                      ? "bg-[#214347] text-white border-[#214347] shadow-md shadow-[#214347]/20" 
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {city}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Container */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
               <Loader2 className="h-16 w-16 animate-spin text-[#214347] mb-6 opacity-20" />
               <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Synchronizing with properties...</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProperties.map((prop, idx) => (
                <div key={prop.id} className="animate-in fade-in slide-in-from-bottom-5 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <PropertyCard prop={prop} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-100 p-20 text-center max-w-2xl mx-auto">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Home className="h-12 w-12 text-gray-200" />
               </div>
               <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No Listings Found</h3>
               <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10">
                 We couldn't find any properties matching your current criteria in {selectedCity || "the region"}. Try adjusting your search or filters.
               </p>
               <button 
                 onClick={() => { setSelectedCity(""); setSearchTerm(""); }}
                 className="bg-[#214347] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#1a3539] transition-all shadow-xl active:scale-95"
               >
                 View All Properties
               </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#214347]">
        <Loader2 className="h-12 w-12 animate-spin text-white opacity-20" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
