"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#214347] text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-12 mb-16">
          {/* Column 1: Company Name & Logo */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              <Link href="/#home" className="flex items-center">
                <img src="/Damal-02.png" alt="Damal Logo" className="h-24 w-auto" />
              </Link>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Damal Property Management is one of the innovative digital property service
              providers in Somalia, founded to offer a wide range of premium real estate
              solutions.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              {[
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
                { name: "Buy", href: "/buy" },
                { name: "Rent", href: "/rent" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">Contact</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-5 flex justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                +252 61 700 0000
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-5 flex justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                info@damal.so
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-5 flex justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                HQ Digfeer, Mogadishu
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              {[Globe, Share2, Mail].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group"
                >
                  <Icon className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-center text-[10px] text-gray-400 font-medium">
          <p>
            Copyright © 2026 Raadsan Prop. All rights reserved. &nbsp; | &nbsp; Powered by Raadsan Teach.
          </p>
        </div>
      </div>
    </footer>
  );
}
