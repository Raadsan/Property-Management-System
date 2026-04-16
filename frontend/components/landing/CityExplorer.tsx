"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getProperties } from "@/api/propertyApi";
import { useRouter } from "next/navigation";

// Local fallback image for cities without property photos
const FALLBACK_IMAGE = "/fallback-property.jpg";

interface CityData {
  name: string;
  listings: number;
  description?: string;
  displayName?: string;
  imageUrl?: string;
}

const CITY_DESCRIPTIONS: Record<string, string> = {
  "Mogadishu": "Discover Luxurious properties in Mogadishu, offering sophisticated living with private pools, modern amenities, and serene surroundings in a thriving community.",
  "Garowe": "Experience the peaceful and growing urban life in Garowe, with modern developments and premium residential options for families and professionals.",
  "Hargeisa": "Explore the vibrant real estate market of Hargeisa, featuring high-end villas and commercial spaces in the heart of the city.",
  "Berbera": "Coastal living at its finest. Find beachfront properties and industrial opportunities in the historic port city of Berbera.",
  "Kismayo": "Enjoy the scenic beauty of Kismayo with our curated selection of properties overlooking the pristine coastline.",
  "Bosaso": "A hub of commerce and growth. Explore diverse property options in the bustling city of Bosaso."
};

export default function CityExplorer() {
  const router = useRouter();
  const [cities, setCities] = useState<CityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const properties = await getProperties();
        
        const cityMap: Record<string, { listings: number; image?: string }> = {};
        
        properties.forEach(prop => {
          const cityName = prop.city?.trim();
          if (!cityName) return;
          
          if (!cityMap[cityName]) {
            cityMap[cityName] = { listings: 0, image: undefined };
          }
          
          cityMap[cityName].listings += 1;
          
          if (!cityMap[cityName].image && prop.images && prop.images.length > 0) {
            const rawUrl = prop.images[0].url;
            if (rawUrl.startsWith('http')) {
              cityMap[cityName].image = rawUrl;
            } else {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://property-management-system-production-e024.up.railway.app/api";
              const baseUrl = apiUrl.replace("/api", "");
              cityMap[cityName].image = `${baseUrl}/${rawUrl.replace(/\\/g, '/').replace(/^\//, '')}`;
            }
          }
        });
        
        const data = Object.keys(cityMap).map(cityName => ({
          name: cityName,
          listings: cityMap[cityName].listings,
          displayName: cityName === 'Mogadishu' ? 'Mugadishu' : cityName,
          imageUrl: cityMap[cityName].image
        }));
        
        setCities(data.sort((a, b) => b.listings - a.listings).slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch city data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCityData();
  }, []);

  const handleCityClick = (cityName: string, normDiff: number, index: number) => {
    if (normDiff === 0) {
      router.push(`/explore?city=${encodeURIComponent(cityName)}`);
    } else {
      setActiveIndex(index);
    }
  };

  const total = cities.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const getCardClasses = (normDiff: number) => {
    const base = "absolute top-1/2 -translate-y-1/2 rounded-[10px] overflow-hidden transition-all duration-700 ease-in-out shadow-lg";
    
    if (normDiff === 0) {
      // CENTER
      return `${base} cursor-default left-1/2 -translate-x-1/2 w-[85%] md:w-[46%] h-[380px] md:h-[420px] z-30 opacity-100`;
    }
    if (normDiff === -1) {
      // LEFT - Perfectly aligned to 0 margin on desktop!
      return `${base} cursor-pointer left-0 -translate-x-[80%] md:translate-x-0 w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-20 opacity-40 md:opacity-100 hover:scale-[1.02]`;
    }
    if (normDiff === 1) {
      // RIGHT - Perfectly aligned to full margin on desktop!
      return `${base} cursor-pointer left-full -translate-x-[20%] md:-translate-x-full w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-20 opacity-40 md:opacity-100 hover:scale-[1.02]`;
    }
    if (normDiff < -1) {
      // HIDDEN FAR LEFT
      return `${base} left-0 -translate-x-[150%] md:-translate-x-[150%] w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-10 opacity-0 pointer-events-none`;
    }
    // HIDDEN FAR RIGHT
    return `${base} left-full translate-x-[50%] md:translate-x-[50%] w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-10 opacity-0 pointer-events-none`;
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#15803d] opacity-20" />
      </div>
    );
  }

  if (cities.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden font-sans">
      {/* Container holding headers and bounded perfectly horizontally */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="mb-8 md:mb-10 text-center">
          {/* <span className="text-[#15803d] font-semibold text-sm md:text-base tracking-wide mb-3 block">
            Featured Property
          </span> */}
          <h2 className="text-3xl md:text-[40px] font-bold text-[#1f2937] tracking-tight leading-tight">
            Recommended Place to Live for You
          </h2>
        </div>

        {/* Dynamic Inner Bounded 3D Carousel */}
        {/* We use relative positioning here so left:0 and left:full lock EXACTLY to the max-w-7xl bounds. */}
        <div className="relative w-full h-[400px] md:h-[450px] my-6">
          {cities.map((city: any, index) => {
            const rawDiff = (index - activeIndex + total) % total;
            let normDiff = rawDiff;
            // Normalize around 0 to ensure proper looping mapping (e.g. [-2, -1, 0, 1, 2])
            if (rawDiff > total / 2) normDiff = rawDiff - total;
            else if (rawDiff < -total / 2) normDiff = rawDiff + total;

            return (
              <div
                key={city.name}
                onClick={() => handleCityClick(city.name, normDiff, index)}
                className={getCardClasses(normDiff)}
              >
                {/* Background Image */}
                <img
                  src={city.imageUrl || FALLBACK_IMAGE}
                  alt={city.displayName || city.name}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out hover:scale-105"
                />
                
                {/* Smooth Edge-to-edge Glass Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-white via-white/95 to-transparent transition-all">
                  <div className="pb-6 pt-24 md:pt-32 px-5 md:px-10 flex flex-col items-center text-center w-full">
                    <h3 className="text-[20px] md:text-[28px] font-bold text-[#1f2937] mb-1 md:mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      {city.displayName || city.name}
                    </h3>
                    
                    {/* Animate description & button height so side-cards look clean */}
                    <div className={`transition-all duration-700 ease-in-out flex flex-col items-center overflow-hidden ${normDiff === 0 ? 'max-h-[300px] opacity-100 mt-1' : 'max-h-0 opacity-0 md:max-h-[300px] md:opacity-100 md:mt-1'}`}>
                      <p className="text-[#64748b] text-[12px] md:text-[14px] font-medium w-full md:max-w-[450px] mb-4 md:mb-5 leading-[1.5] line-clamp-2">
                        {CITY_DESCRIPTIONS[city.name] || `Discover Luxurious properties in ${city.displayName}, offering sophisticated living with modern amenities.`}
                      </p>
                      
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleCityClick(city.name, 0, index);
                        }}
                        className="px-6 py-2 md:px-8 md:py-2.5 bg-[#214347] border border-[#214347] hover:bg-[#163033] transition-colors rounded-full text-white font-medium text-[13px] md:text-[14px] whitespace-nowrap shadow-md"
                      >
                        Explore more
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Navigation Controls */}
        <div className="mt-8 md:mt-12">
          <div className="flex items-center justify-between">
            <button 
              onClick={handlePrev}
              className="w-[52px] h-[52px] rounded-[14px] border bg-white flex items-center justify-center transition-all shadow-sm border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => router.push('/explore')}
              className="px-8 md:px-12 py-3.5 bg-[#214347] hover:bg-[#163033] text-white rounded-[14px] font-medium text-[15px] transition-all shadow-md"
            >
              Show all Property
            </button>

            <button 
               onClick={handleNext}
               className="w-[52px] h-[52px] rounded-[14px] border bg-white flex items-center justify-center transition-all shadow-sm border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
