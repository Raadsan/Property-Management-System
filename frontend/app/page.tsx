import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeaturedProperties from "@/components/landing/FeaturedProperties";
import CityExplorer from "@/components/landing/CityExplorer";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedProperties />
      <CityExplorer />
      <WhyChooseUs />
      <CTA />
      <Footer />
    </main>
  );
}
