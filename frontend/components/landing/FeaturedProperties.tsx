"use client";
 
import PropertyCard from "./PropertyCard";
import { useState, useEffect } from "react";
import { getProperties, Property } from "@/api/propertyApi";
import { Skeleton } from "@/components/ui/skeleton";
 
export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        const approvedProperties = data.filter((p: Property) => p.status !== "CREATED");
        setProperties(approvedProperties.slice(0, 3)); // Display first 3 approved properties
      } catch (error) {
        console.error("Failed to fetch featured properties:", error);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchProperties();
  }, []);
 
  return (
    <section className="pt-36 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Properties
          </h2>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, idx) => (
              <div key={idx} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                <Skeleton className="h-4 w-1/2 bg-gray-200" />
              </div>
            ))
          ) : properties.length > 0 ? (
            properties.map((prop) => (
              <PropertyCard key={prop.id} prop={prop} />
            ))
          ) : (
             <div className="col-span-full text-center text-gray-500 py-10">
               No properties found.
             </div>
          )}
        </div>
 
        {/* Pagination Dots */}
        {!isLoading && properties.length > 1 && (
          <div className="flex justify-center gap-2 mt-12">
              {Array(Math.ceil(properties.length / 3)).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all ${i === 0 ? "bg-gray-800" : "bg-gray-300"}`}
                  />
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
