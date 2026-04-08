"use client";

import { Mail, Send } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-[#214347] rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
          {/* Subtle Decorative Circles */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Mail Icon Circle */}
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 shadow-sm">
              <Mail className="h-6 w-6 text-white" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
               Stay Updated with Our Newsletter
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Get the latest updates on our creative campaigns, industry insights, 
              and exclusive offers delivered straight to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm shadow-inner">
              <div className="relative flex-grow">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full bg-white text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eae1d2] transition-all font-medium text-sm"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <button
                type="submit"
                className="bg-[#eae1d2] text-[#214347] px-6 py-3 rounded-lg font-bold text-sm hover:bg-white transition-all active:scale-95 shadow-md whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </form>

            <p className="text-white/40 text-xs mt-6 italic">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
