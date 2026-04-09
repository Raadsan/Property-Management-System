"use client";
 
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  MapPin, 
  Star,
  BedDouble,
  Bath,
  Home,
  Wind,
  ChefHat,
  Container,
  Wifi,
  Car,
  User,
  Activity,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getPropertyById, Property } from "@/api/propertyApi";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
 
export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    if (isGalleryOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetScroll = selectedImgIndex * container.clientWidth;
      container.scrollTo({ left: targetScroll, behavior: 'instant' });
    }
  }, [isGalleryOpen, selectedImgIndex]);

  useEffect(() => {
    if (!id) return;
    
    // Check for user session
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user");
      }
    }

    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(parseInt(id));
        setProperty(data);
      } catch (error) {
        console.error("Failed to fetch property details:", error);
        toast.error("Property not found");
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchProperty();
  }, [id]);

  const handleAction = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.error("Please login to contact the owner");
      router.push("/login");
      return;
    }
  };
 
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1300px] mx-auto px-6 pt-32 pb-20">
          <Skeleton className="h-[500px] w-full rounded-2xl mb-10" />
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-10" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Footer />
      </main>
    );
  }
 
  if (!property) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1300px] mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold">Property not found</h1>
        </div>
        <Footer />
      </main>
    );
  }
 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace("/api", "");
  
  const displayImages = property.images && property.images.length > 0 
    ? property.images.map(img => img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`)
    : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"];

  const openGallery = (index: number) => {
    setSelectedImgIndex(index);
    setIsGalleryOpen(true);
  };

  const nextImage = () => {
    setSelectedImgIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedImgIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-gray-100">
      <Navbar />
 
      <div className="max-w-[1300px] mx-auto px-6 pt-32 pb-20">
        
        {/* Gallery Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px] md:h-[600px] mb-10 overflow-hidden cursor-pointer" onClick={() => openGallery(0)}>
          <div className="md:col-span-3 h-full bg-gray-100 rounded-2xl overflow-hidden group">
            <img 
              src={displayImages[0]} 
              className="w-full h-full object-cover rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-105" 
              alt={property.title} 
            />
          </div>
          <div className="md:col-span-1 grid grid-rows-3 gap-4 h-full">
            {displayImages.slice(1, 4).map((img, idx) => (
              <div 
                key={idx} 
                className="h-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-50 relative group"
                onClick={(e) => { e.stopPropagation(); openGallery(idx + 1); }}
              >
                <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`${property.title} view ${idx + 2}`} />
                {idx === 2 && displayImages.length > 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                    <span className="text-white text-3xl font-bold">{displayImages.length - 4}+</span>
                  </div>
                )}
              </div>
            ))}
            {/* Fill empty slots if less than 4 images */}
            {displayImages.length < 4 && Array(4 - displayImages.length).fill(0).map((_, idx) => (
              <div key={`placeholder-${idx}`} className="h-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100" />
            ))}
          </div>
        </div>
 
        {/* 1. Header & Description (Full Width) */}
        <div className="mb-12">
          {/* Header */}
          <div className="mb-6 p-1">
            <div className="flex items-center gap-2 mb-3">
               <span className="bg-[#214347] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                 {property.listingType}
               </span>
               <span className="bg-[#eae1d2] text-[#214347] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                 {property.status}
               </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight capitalize">{property.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-y-3 gap-x-10">
              <div className="flex items-center gap-5 text-[13px] text-gray-500 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{property.city}, {property.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-black">5.0</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 border-l border-gray-100 md:pl-10">
                <span className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tighter">${property.price.toLocaleString()}</span>
                {/* <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">USD</span> */}
              </div>
            </div>
          </div>
 
          {/* Description */}
          <div className="max-w-4xl">
            <h4 className="text-[15px] font-bold text-gray-900 mb-3">Description:</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed font-light whitespace-pre-line">
              {property.description || "No description provided for this property."}
            </p>
          </div>
        </div>
 
        {/* 2. Key Features & Quick Actions (Aligned Row) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Amenities (Left - 2/3) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-[15px] font-bold text-gray-900 mb-4">Key Features:</h4>
            <div className="border border-gray-100 rounded-[24px] p-10 bg-white shadow-sm flex-grow">
              <h5 className="text-[17px] font-bold text-gray-900 mb-9">Amenities & Specs</h5>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
                <div className="flex items-center gap-3 group">
                   <div className="text-gray-300 group-hover:text-[#0a74b3] transition-colors"><Activity className="h-5 w-5 stroke-[1.5]" /></div>
                   <span className="text-[13px] font-semibold text-gray-800">{property.propertyType?.name || "Property"}</span>
                </div>
                <div className="flex items-center gap-3 group">
                   <div className="text-gray-300 group-hover:text-[#0a74b3] transition-colors"><Home className="h-5 w-5 stroke-[1.5]" /></div>
                   <span className="text-[13px] font-semibold text-gray-800">{property.sizeLabel || "Standard"}</span>
                </div>
                {property.area && (
                  <div className="flex items-center gap-3 group">
                     <div className="text-gray-300 group-hover:text-[#0a74b3] transition-colors"><MapPin className="h-5 w-5 stroke-[1.5]" /></div>
                     <span className="text-[13px] font-semibold text-gray-800">{property.area} sqm</span>
                  </div>
                )}
                {property.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <div className="text-gray-300 group-hover:text-[#0a74b3] transition-colors">
                      <Star className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-800">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Quick Actions (Right - 1/3) */}
          <div className="lg:col-span-1 flex flex-col">
            <h4 className="text-[15px] font-bold text-white mb-4 select-none lg:block hidden">_</h4>
            <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex flex-col h-full justify-between">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-8">Secure Booking</h4>
                <div className="space-y-4">
                  <button 
                    onClick={handleAction}
                    className="w-full flex items-center justify-center gap-4 bg-[#214347] text-white py-5 rounded-2xl font-bold hover:bg-[#1a3539] transition-all text-sm uppercase tracking-widest active:scale-[0.98]"
                  >
                    <Activity className="h-5 w-5" /> Login to Book Now
                  </button>
                  <a 
                    href={`https://wa.me/${property.owner?.phone?.replace(/\+/g, '')}`}
                    target="_blank"
                    onClick={handleAction}
                    className="w-full flex items-center justify-center gap-4 bg-[#26ce61] text-white py-5 rounded-2xl font-bold hover:bg-[#20b453] transition-all text-sm uppercase tracking-widest active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg> contact to whatsapp
                  </a>
                </div>
              </div>
 
              <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Typically responds <br className="lg:hidden" /> within 1 hour</p>
              </div>
            </div>
          </div>
 
        </div>
      </div>
 
      <Footer />

      {/* Lightbox / Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent 
          className="fixed !inset-0 !m-0 !p-0 !max-w-none !w-screen !h-screen !border-none bg-black z-[200] flex flex-col justify-center outline-none !translate-x-0 !translate-y-0 !top-0 !left-0 rounded-none shadow-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Property Gallery</DialogTitle>
          <DialogDescription className="sr-only">Full-screen property image viewer</DialogDescription>
          
          {/* Close Button - Fixed to viewport */}
          <button 
            onClick={() => setIsGalleryOpen(false)}
            className="fixed top-8 right-8 z-[250] p-4 bg-white/10 hover:bg-white/30 rounded-full text-white transition-all backdrop-blur-md hover:rotate-90 shadow-2xl"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Large Navigation Arrows - Fixed to viewport edges */}
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="fixed left-8 top-1/2 -translate-y-1/2 z-[250] p-6 bg-black/40 hover:bg-white/10 rounded-full text-white transition-all border border-white/10 group active:scale-90"
          >
            <ChevronLeft className="w-12 h-12 md:w-20 md:h-20" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="fixed right-8 top-1/2 -translate-y-1/2 z-[250] p-6 bg-black/40 hover:bg-white/10 rounded-full text-white transition-all border border-white/10 group active:scale-90"
          >
            <ChevronRight className="w-12 h-12 md:w-20 md:h-20" />
          </button>

          {/* Main Visual Stage */}
          <div className="w-screen h-screen flex items-center justify-center p-0 md:p-8 bg-black">
             <img 
               key={selectedImgIndex}
               src={displayImages[selectedImgIndex]} 
               className="w-full h-full object-contain select-none transition-all duration-300 animate-in fade-in zoom-in-95"
               alt={`Property view ${selectedImgIndex + 1}`}
             />

             {/* Indicator Piller */}
             <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-2xl px-12 py-4 rounded-full text-white text-xl font-bold tracking-[0.4em] border border-white/20 z-[250] shadow-2xl">
               {selectedImgIndex + 1} / {displayImages.length}
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
