"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PropertyCard from "@/components/landing/PropertyCard";
import { getProperties, Property } from "@/api/propertyApi";
import { Search, Loader2, Home } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocations } from "@/hooks/useLocations";

function ExploreContent() {
  const searchParams = useSearchParams();
  const { cityOptions, defaultCity, getDistrictOptions } = useLocations();

  const initialCity = searchParams.get("city") || defaultCity || "Mogadishu";
  const initialDistrict = searchParams.get("district") || "";
  const initialType = searchParams.get("type") || "";
  const initialListingType = searchParams.get("listingType") || "";
  const initialMinPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null;
  const initialMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null;

  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState(initialCity);
  const [selectedDistrict, setSelectedDistrict] = React.useState(initialDistrict);
  const [selectedType, setSelectedType] = React.useState(initialType);
  const [selectedListingType, setSelectedListingType] = React.useState(initialListingType);
  const [selectedStatus, setSelectedStatus] = React.useState("");

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

  const somaliCities = cityOptions.map((c) => c.value);

  const districtsList = React.useMemo(() => {
    if (!selectedCity || selectedCity === "all") return [];
    const predefined = getDistrictOptions(selectedCity).map((d) => d.value);
    const targetCity =
      selectedCity === "Muqdisho" || selectedCity === "Mogadishu"
        ? "Mogadishu"
        : selectedCity;
    const fromDb = properties
      .filter(
        (p) =>
          p.city === selectedCity ||
          (targetCity === "Mogadishu" &&
            (p.city === "Mogadishu" || p.city === "Muqdisho"))
      )
      .map((p) => p.district)
      .filter(Boolean) as string[];
    return Array.from(new Set([...predefined, ...fromDb]));
  }, [properties, selectedCity]);

  const typesList = React.useMemo(() => {
    const unique = new Set(properties.map(p => p.propertyType?.name).filter(Boolean));
    return Array.from(unique);
  }, [properties]);

  // Filter Logic
  const filteredProperties = properties.filter((p) => {
    const matchesCity = !selectedCity || selectedCity === "all" ||
      p.city.toLowerCase() === selectedCity.toLowerCase() ||
      (selectedCity === "Mogadishu" && p.city.toLowerCase() === "muqdisho") ||
      (selectedCity === "Muqdisho" && p.city.toLowerCase() === "mogadishu") ||
      (selectedCity === "Galkacyo" && p.city.toLowerCase() === "galkacayo") ||
      (selectedCity === "Galkacayo" && p.city.toLowerCase() === "galkacyo");
    const matchesDistrict = !selectedDistrict || selectedDistrict === "all" || p.district === selectedDistrict;
    const matchesSearch = !searchTerm ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === "all" || p.propertyType?.name.toLowerCase() === selectedType.toLowerCase();
    const matchesListingType = !selectedListingType || selectedListingType === "all" || p.listingType.toUpperCase() === selectedListingType.toUpperCase();
    const matchesStatus = !selectedStatus || selectedStatus === "all" || p.status.toUpperCase() === selectedStatus.toUpperCase();
    
    let matchesPrice = true;
    if (initialMinPrice !== null && p.price < initialMinPrice) matchesPrice = false;
    if (initialMaxPrice !== null && p.price > initialMaxPrice) matchesPrice = false;

    const isApproved = p.status !== "CREATED";

    return matchesCity && matchesDistrict && matchesSearch && matchesType && matchesListingType && matchesPrice && isApproved && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* 1. Header Banner */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347] overflow-hidden">
        {/* Subtle radial gradient and Grid Lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a3538]/50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none [mask-image:linear-gradient(to_bottom,white_10%,transparent_80%)]"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {selectedCity ? (
              <>Properties in <span className="text-[#eae1d2]">{selectedCity}</span></>
            ) : (
              <>Explore <span className="text-[#eae1d2]">Properties</span></>
            )}
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Discover homes, apartments, hotels, and event venues across Somalia through a trusted platform designed to make finding your next property simple, transparent, and convenient.
          </p>
        </div>
      </section>

      {/* Search & filters — no container background */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
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

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5 min-w-[130px] flex-1 md:flex-none">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Status</Label>
              <Select value={selectedStatus || "all"} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white text-black font-medium text-sm [&_svg]:text-black">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px] flex-1 md:flex-none">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Prop Type</Label>
              <Select value={selectedType || "all"} onValueChange={setSelectedType}>
                <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white text-black font-medium text-sm [&_svg]:text-black">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {typesList.map(t => (
                    <SelectItem key={t!} value={t!}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px] flex-1 md:flex-none">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Listing</Label>
              <Select value={selectedListingType || "all"} onValueChange={setSelectedListingType}>
                <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white text-black font-medium text-sm [&_svg]:text-black">
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="SALE">Buy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px] flex-1 md:flex-none">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">City</Label>
              <Select value={selectedCity || "all"} onValueChange={(val) => { setSelectedCity(val === "all" ? "" : val); setSelectedDistrict(""); }}>
                <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white text-black font-medium text-sm [&_svg]:text-black">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {somaliCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[130px] flex-1 md:flex-none">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">District</Label>
              <Select value={selectedDistrict || "all"} onValueChange={(val) => setSelectedDistrict(val === "all" ? "" : val)} disabled={!selectedCity || selectedCity === "all"}>
                <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white text-black font-medium text-sm disabled:opacity-60 [&_svg]:text-black">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districtsList.map(district => (
                    <SelectItem key={district!} value={district!}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto">
              <button
                onClick={() => { setSelectedStatus(""); setSelectedType(""); setSelectedListingType(""); setSelectedCity("Mogadishu"); setSelectedDistrict(""); setSearchTerm(""); }}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-500 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

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
