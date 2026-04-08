"use client";

import { MoveRight } from "lucide-react";

const cities = [
  {
    id: 1,
    name: "Mogadishu",
    listings: "420+ Listings",
    image: "https://images.unsplash.com/photo-1496564203457-11bb12075d90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    size: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    name: "Hargeisa",
    listings: "280+ Listings",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    size: "md:col-span-1 md:row-span-1",
  },
  {
    id: 3,
    name: "Garowe",
    listings: "150+ Listings",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    size: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    name: "Kismayo",
    listings: "95+ Listings",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    size: "md:col-span-2 md:row-span-1",
  },
];

export default function CityExplorer() {
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
          {cities.map((city) => (
            <div
              key={city.id}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${city.size} min-h-[200px]`}
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <div className="mb-2 bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                  {city.listings}
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2 group-hover:underline">
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
