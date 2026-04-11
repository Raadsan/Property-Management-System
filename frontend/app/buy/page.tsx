"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PropertyCard from "@/components/landing/PropertyCard";
import { Search, HomeIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getProperties, Property } from "@/api/propertyApi";
import { getPropertyTypes, Category } from "@/api/propertyTypeApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuyPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [propsData, catsData] = await Promise.all([
          getProperties(),
          getPropertyTypes(),
        ]);
        // Only SALE listings
        setProperties(propsData.filter((p) => p.listingType === "SALE"));
        setCategories(catsData);
      } catch (err) {
        console.error("Failed to load buy page data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      p.propertyType?.name?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Properties For Sale
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Browse our elite selection of properties available for purchase across the region.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, city, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 bg-white shadow-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#eae1d2] text-[15px]"
            />
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="py-5 bg-white border-b border-gray-100 sticky top-20 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-3 pb-1 pt-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`flex-shrink-0 px-5 py-2.5 rounded-[12px] border font-semibold text-[14px] transition-all whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-[#214347] text-white border-[#214347] shadow-md shadow-[#214347]/20"
                  : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-[12px] border font-semibold text-[14px] transition-all whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? "bg-[#214347] text-white border-[#214347] shadow-md shadow-[#214347]/20"
                    : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Count */}
          {!isLoading && (
            <p className="text-sm text-gray-500 font-medium mb-6">
              Showing <span className="font-bold text-gray-800">{filtered.length}</span> propert{filtered.length !== 1 ? "ies" : "y"} for sale
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((prop) => (
                <PropertyCard key={prop.id} prop={prop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <HomeIcon className="h-12 w-12 mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">No properties found.</p>
              <p className="text-gray-400 text-sm mt-1">Try a different category or search term.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
