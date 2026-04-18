"use client";

import * as React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendContactMessage } from "@/api/contactApi";

export default function ContactPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "General",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInquiryChange = (subject: string) => {
    setFormData(prev => ({ ...prev, inquiryType: subject }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendContactMessage(formData);
      toast.success(response.message || "Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        inquiryType: "General",
        message: ""
      });
    } catch (error: any) {
      console.error("Contact submit error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again later.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen font-sans bg-[#f8f9fa]">
      <Navbar />

      {/* 1. Header Banner */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347] overflow-hidden">
        {/* Subtle radial gradient and Grid Lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a3538]/50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none [mask-image:linear-gradient(to_bottom,white_10%,transparent_80%)]"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* 2. Main Contact Section */}
      <section className="py-16 md:py-24 relative z-20 -mt-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
           <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
              
              {/* Left Side: Contact Info Sidebar */}
              <div className="lg:w-2/5 bg-[#214347] p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
                 {/* Subtle decorative background circles */}
                 <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

                 <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-3 tracking-tight">Get in Touch</h3>
                    <p className="text-teal-50/80 text-[15px] mb-12 font-light leading-relaxed">
                       Fill out the form and our team will get back to you within 24 hours.
                    </p>

                    <div className="flex flex-col gap-8">
                       <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Phone
                          </span>
                          <span className="text-lg font-medium">+252 613052542 / 613055580</span>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Email
                          </span>
                          <span className="text-lg font-medium">imustaqbalproperties@gmail.com</span>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Office
                          </span>
                          <span className="text-lg font-medium leading-relaxed max-w-[200px]">
                            HQ Digfeer,<br/>Mogadishu, Somalia
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="relative z-10 pt-16 flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eae1d2] hover:text-[#214347] transition-all text-white">
                       <MessageSquare className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eae1d2] hover:text-[#214347] transition-all text-white">
                       <Clock className="h-4 w-4" />
                    </a>
                 </div>
              </div>

              {/* Right Side: Contact Form */}
              <div className="lg:w-3/5 p-8 md:p-12 lg:p-14 bg-white">
                 <form onSubmit={handleSubmit} className="flex flex-col gap-7 text-gray-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">First Name</label>
                          <input 
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="John"
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Last Name</label>
                          <input 
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="Doe"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Email</label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="john@example.com"
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Phone</label>
                          <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all text-[15px]"
                            placeholder="+252 61..."
                          />
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-2">
                       <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Inquiry Type</label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {["General", "Renting", "Buying", "Support"].map((subject) => (
                             <label key={subject} className="cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="inquiryType" 
                                  className="peer sr-only" 
                                  checked={formData.inquiryType === subject}
                                  onChange={() => handleInquiryChange(subject)}
                                />
                                <div className="text-center px-2 py-2.5 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-500 peer-checked:bg-[#214347] peer-checked:text-white peer-checked:border-[#214347] hover:bg-gray-50 transition-all font-sans">
                                   {subject}
                                </div>
                             </label>
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                       <label className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">Message</label>
                       <textarea 
                         name="message"
                         value={formData.message}
                         onChange={handleChange}
                         required
                         rows={5} 
                         className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#214347]/20 focus:border-[#214347] transition-all resize-none text-[15px]"
                         placeholder="How can we help you?"
                       ></textarea>
                    </div>

                    <div className="pt-6">
                       <button 
                         type="submit" 
                         disabled={isLoading}
                         className="bg-[#214347] text-white px-8 py-4 rounded-xl font-bold text-[15px] tracking-wide hover:bg-[#0d2326] transition-colors active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                       >
                          {isLoading ? (
                            <>Sending... <Loader2 className="w-4 h-4 ml-1 animate-spin" /></>
                          ) : (
                            <>Send Message <Send className="w-4 h-4 ml-1" /></>
                          )}
                       </button>
                    </div>
                 </form>
              </div>

           </div>
        </div>
      </section>

      {/* 3. Map Section */}
      <section className="pb-24 pt-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
           <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
              <div className="p-2 h-[450px] w-full">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.176413289053!2d45.3113972!3d2.036063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3d07e94bc65f6c8d%3A0x6bba3bc7f677d61c!2sDeero%20Institute!5e0!3m2!1sen!2sso!4v1713430800000!5m2!1sen!2sso"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location"
                    className="rounded-xl"
                  ></iframe>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
