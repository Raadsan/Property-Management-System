"use client";

import React from "react";
import { MoveRight, Loader2 } from "lucide-react";
import { getCityStats } from "@/api/propertyApi";
import { useRouter } from "next/navigation";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1496564203457-11bb12075d90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const LAYOUT_SIZES = [
  "md:col-span-2 md:row-span-2", // Big one
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1", // Wide one
];

interface CityData {
  name: string;
  listings: number;
}

export default function CityExplorer() {
  const router = useRouter();
  const [cities, setCities] = React.useState<CityData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getCityStats();
        // Sort by listings count to show most active cities first
        setCities(data.sort((a, b) => b.listings - a.listings).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch city stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCityClick = (cityName: string) => {
    router.push(`/explore?city=${encodeURIComponent(cityName)}`);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#214347] opacity-20" />
      </div>
    );
  }

  if (cities.length === 0) return null;

  return (
    <section className="pt-8 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
             Find Properties in <span className="text-[#214347]">These Cities</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
            Discover the best property management options and listings across 
            the most vibrant cities in the region.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[400px]">
          {cities.map((city, index) => (
            <div
              key={city.name}
              onClick={() => handleCityClick(city.name)}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${LAYOUT_SIZES[index] || "md:col-span-1 md:row-span-1"} min-h-[220px]`}
            >
              <img
                src={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                <div className="mb-2 bg-white/20 backdrop-blur-md w-fit px-4 py-1.5 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.15em] border border-white/10">
                  {city.listings} {city.listings === 1 ? 'Listing' : 'Listings'}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:underline tracking-tight">
                  {city.name}
                </h3>
                <div className="flex items-center gap-2 text-white font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                   Explore More <MoveRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
