"use client";

import PropertyCard from "./PropertyCard";
import { useState } from "react";

const properties = [
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
    title: "al-noor-commercial-hub",
    price: "$125,100/mo",
    category: "Business center",
    location: "Maka Almukarama, Mogadishu, Banaadir",
    floors: 2,
    sqrm: "25x30",
    units: 3,
    tag: "For Sale",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
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
];

export default function FeaturedProperties() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="pt-36 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Featured Properties
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
             <PropertyCard key={prop.id} prop={prop} />
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-12">
            {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all ${i === 0 ? "bg-gray-800" : "bg-gray-300"}`}
                />
            ))}
        </div>
      </div>
    </section>
  );
}
