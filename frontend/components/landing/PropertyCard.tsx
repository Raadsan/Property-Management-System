"use client";

import { useState, useEffect } from "react";
import { MapPin, Heart, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { Property } from "@/api/propertyApi";
 
interface PropertyCardProps {
  prop: Property;
}
 
export default function PropertyCard({ prop }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check if property is in favorites on mount
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(prop.id));
  }, [prop.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: number[];
    
    if (favorites.includes(prop.id)) {
      newFavorites = favorites.filter((id: number) => id !== prop.id);
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, prop.id];
      setIsFavorite(true);
    }
    
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://property-management-system-production-e024.up.railway.app/api";
  const baseUrl = apiUrl.replace("/api", "");
  
  const imageUrl = prop.images && prop.images.length > 0 
    ? (prop.images[0].url.startsWith('http') ? prop.images[0].url : `${baseUrl}/${prop.images[0].url.replace(/\\/g, '/').replace(/^\//, '')}`)
    : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/properties/${prop.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={prop.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
          <span className="bg-[#214347] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {prop.listingType}
          </span>
          <span className="bg-[#eae1d2] text-[#214347] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {prop.status}
          </span>
        </div>
 
        {/* Image Footer Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end pointer-events-none">
          <div className="text-white text-xl font-bold drop-shadow-sm">
             ${prop.price.toLocaleString()}
          </div>
          <div className="flex gap-2 mb-1 pointer-events-auto">
            <button className="p-2 bg-white hover:bg-[#eae1d2] transition-colors rounded-lg text-[#214347] shadow-sm">
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <button 
              onClick={toggleFavorite}
              className={`p-2 transition-colors rounded-lg shadow-sm ${
                isFavorite ? "bg-[#214347] text-white" : "bg-white hover:bg-[#eae1d2] text-[#214347]"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
 
      {/* Content Section */}
      <div className="p-6">
        <div className="text-[#214347] text-xs font-bold uppercase tracking-widest mb-2">
          {prop.propertyType?.name || "Property"}
        </div>
        <Link href={`/properties/${prop.id}`}>
          <h3 className="text-xl font-bold text-[#444] mb-3 hover:text-[#214347] cursor-pointer transition-colors capitalize line-clamp-1">
            {prop.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 text-gray-500 mb-4 text-sm truncate">
          <MapPin className="h-4 w-4" />
          {prop.city}, {prop.location}
        </div>
 
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-gray-50 text-[12px] text-gray-500 font-medium">
          <div>Size: {prop.sizeLabel || "N/A"}</div>
          {prop.area && <div>Area: {prop.area} sqm</div>}
          <div>Rooms: {prop.Rooms || 0}</div>
          <div>Baths: {prop.Bathrooms || 0}</div>
        </div>
      </div>
    </div>
  );
}
