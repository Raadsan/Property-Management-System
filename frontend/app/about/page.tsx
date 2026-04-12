"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import { Users, Building2, TrendingUp, Target, Lightbulb } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen font-sans bg-gray-50/50">
      <Navbar />

      {/* 1. Header Banner */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 text-white/90 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-[#eae1d2]"></span>
            Who We Are
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Elevating <span className="text-[#eae1d2]">Property</span> Management
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Discover who we are, what drives us, and how we're transforming real estate and property management in Somalia with digital innovation.
          </p>
        </div>
      </section>

      {/* 2. Second Section: Vision and Mission */}
      <section className="py-24 bg-gradient-to-br from-[#f8fbff] to-[#f0f7ff] relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
               Our <span className="text-[#214347]">Purpose</span>
             </h2>
             <div className="w-24 h-1 bg-[#214347] mx-auto mt-6 rounded-full opacity-80"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-7xl mx-auto">
            {/* Vision */}
            <div className="px-8 py-10 md:px-12 md:py-12 flex flex-col items-center justify-center text-center bg-white hover:bg-[#214347] rounded-[1.5rem] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group min-h-[280px]">
               <div className="w-20 h-20 bg-[#214347] group-hover:bg-white rounded-full flex items-center justify-center mb-6 shadow-md transition-colors duration-300 relative">
                 <Lightbulb className="text-white group-hover:text-[#214347] h-9 w-9 transition-colors duration-300" />
               </div>
               <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-gray-900 group-hover:text-white transition-colors duration-300">Vision</h3>
               <p className="text-gray-600 group-hover:text-white/90 leading-relaxed text-[15px] md:text-base max-w-lg transition-colors duration-300">
                 To become the most trusted and innovative property management platform, empowering individuals and businesses to seamlessly navigate the real estate market with confidence and transparency.
               </p>
            </div>

            {/* Mission */}
            <div className="px-8 py-10 md:px-12 md:py-12 flex flex-col items-center justify-center text-center bg-white hover:bg-[#214347] rounded-[1.5rem] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group min-h-[280px]">
               <div className="w-20 h-20 bg-[#214347] group-hover:bg-white rounded-full flex items-center justify-center mb-6 shadow-md transition-colors duration-300 relative">
                 <Target className="text-white group-hover:text-[#214347] h-9 w-9 transition-colors duration-300" />
               </div>
               <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-gray-900 group-hover:text-white transition-colors duration-300">Mission</h3>
               <p className="text-gray-600 group-hover:text-white/90 leading-relaxed text-[15px] md:text-base max-w-lg transition-colors duration-300">
                 To provide fully transparent, client-centric, and exceptionally reliable services that simplify buying, renting, and managing properties using modern technology tailored for the African market.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Third Section: Core Values */}
      <section className="py-24 bg-white border-y border-gray-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#214347]/20 to-transparent"></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
               Our Core <span className="text-[#214347]">Values</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              We operate on principles that ensure every interaction is meaningful, 
              secure, and efficient for all parties involved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: "Client-Centric",
                desc: "Your success is our success. We listen, adapt, and deliver specifically to your unique needs."
              },
              {
                icon: Building2,
                title: "Transparency",
                desc: "No hidden fees. Full reporting. Every transaction and property detail is clear as day."
              },
              {
                icon: TrendingUp,
                title: "Reliability",
                desc: "We are on the ground, 24/7. Ensuring your property is maintained and tenants are satisfied."
              }
            ].map((value, i) => (
              <div key={i} className="p-10 rounded-[2rem] bg-gray-50 hover:bg-[#214347] group transition-all duration-300 hover:-translate-y-3 cursor-pointer shadow-sm hover:shadow-2xl">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-white/10 transition-colors">
                    <value.icon className="text-[#214347] h-8 w-8 group-hover:text-white transition-colors" />
                 </div>
                 <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-white transition-colors">
                    {value.title}
                 </h3>
                 <p className="text-gray-500 leading-relaxed group-hover:text-white/80 transition-colors">
                    {value.desc}
                 </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Fourth Section: Why Choose Us */}
      <WhyChooseUs />

      <Footer />
    </main>
  );
}
