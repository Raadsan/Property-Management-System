"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getProperties, Property } from "@/api/propertyApi";
import { useRouter } from "next/navigation";
import { isVideoItem, resolveMediaUrl, sortMediaVideosFirst } from "@/lib/mediaUtils";

const FALLBACK_IMAGE = "/fallback-property.jpg";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

const getPrimaryMedia = (prop: Property) =>
  prop.images?.length ? sortMediaVideosFirst(prop.images)[0] : null;

export default function CityExplorer() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getProperties({ features: true, status: "AVAILABLE" });
        setProperties(data.filter((p) => p.status === "AVAILABLE" && p.features === true));
      } catch (error) {
        console.error("Failed to fetch featured properties:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handlePropertyClick = (prop: Property, normDiff: number, index: number) => {
    if (normDiff === 0) {
      router.push(`/properties/${slugify(prop.title)}`);
    } else {
      setActiveIndex(index);
    }
  };

  const total = properties.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const getCardClasses = (normDiff: number) => {
    const base = "absolute top-1/2 -translate-y-1/2 rounded-[10px] overflow-hidden transition-all duration-700 ease-in-out shadow-lg";

    if (normDiff === 0) {
      return `${base} cursor-default left-1/2 -translate-x-1/2 w-[85%] md:w-[46%] h-[380px] md:h-[420px] z-30 opacity-100`;
    }
    if (normDiff === -1) {
      return `${base} cursor-pointer left-0 -translate-x-[80%] md:translate-x-0 w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-20 opacity-40 md:opacity-100 hover:scale-[1.02]`;
    }
    if (normDiff === 1) {
      return `${base} cursor-pointer left-full -translate-x-[20%] md:-translate-x-full w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-20 opacity-40 md:opacity-100 hover:scale-[1.02]`;
    }
    if (normDiff < -1) {
      return `${base} left-0 -translate-x-[150%] md:-translate-x-[150%] w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-10 opacity-0 pointer-events-none`;
    }
    return `${base} left-full translate-x-[50%] md:translate-x-[50%] w-[85%] md:w-[25%] h-[300px] md:h-[340px] z-10 opacity-0 pointer-events-none`;
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#15803d] opacity-20" />
      </div>
    );
  }

  if (properties.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="text-3xl md:text-[40px] font-bold text-[#1f2937] tracking-tight leading-tight">
            Featured Properties
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 my-6">
          {total > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous property"
              className="shrink-0 w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] border bg-white flex items-center justify-center transition-all shadow-md border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="relative flex-1 min-w-0 h-[400px] md:h-[450px]">
            {properties.map((prop, index) => {
            const rawDiff = (index - activeIndex + total) % total;
            let normDiff = rawDiff;
            if (rawDiff > total / 2) normDiff = rawDiff - total;
            else if (rawDiff < -total / 2) normDiff = rawDiff + total;

            const primary = getPrimaryMedia(prop);
            const mediaUrl = primary ? resolveMediaUrl(primary.url) : FALLBACK_IMAGE;

            return (
              <div
                key={prop.id}
                onClick={() => handlePropertyClick(prop, normDiff, index)}
                className={getCardClasses(normDiff)}
              >
                {primary && isVideoItem(primary) ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out hover:scale-105"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out hover:scale-105"
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-white via-white/95 to-transparent transition-all">
                  <div className="pb-6 pt-24 md:pt-32 px-5 md:px-10 flex flex-col items-center text-center w-full">
                    <h3 className="text-[20px] md:text-[28px] font-bold text-[#1f2937] mb-1 md:mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full capitalize">
                      {prop.title}
                    </h3>

                    <div className={`transition-all duration-700 ease-in-out flex flex-col items-center overflow-hidden ${normDiff === 0 ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0 md:max-h-[300px] md:opacity-100 md:mt-1"}`}>
                      <p className="text-[#64748b] text-[12px] md:text-[14px] font-medium w-full md:max-w-[450px] mb-4 md:mb-5 leading-[1.5] line-clamp-2">
                        {prop.description ||
                          `Discover this property in ${prop.city}, offering sophisticated living with modern amenities.`}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/properties/${slugify(prop.title)}`);
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

          {total > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next property"
              className="shrink-0 w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] border bg-white flex items-center justify-center transition-all shadow-md border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="mt-8 md:mt-12 flex justify-center">
          <button
            onClick={() => router.push("/explore")}
            className="px-8 md:px-12 py-3.5 bg-[#214347] hover:bg-[#163033] text-white rounded-[14px] font-medium text-[15px] transition-all shadow-md"
          >
            Show all Property
          </button>
        </div>
      </div>
    </section>
  );
}
