import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#214347] text-white pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-x-12 gap-y-12 mb-16">
          {/* Column 1: Identity & Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
            <div className="flex justify-center md:justify-start">
              <Link href="/#home" className="flex items-center">
                <img src="/Damal-02.png" alt="Damal Logo" className="h-24 w-auto" />
              </Link>
            </div>
            <p className="text-gray-400 text-[15px] leading-relaxed max-w-sm">
              Damal Property Management is a leading innovative digital property service
              provider in Somalia, offering a wide range of premium real estate
              solutions for modern living.
            </p>
            {/* Social Icons - Clean Row */}
            <div className="flex items-center justify-center md:justify-start gap-5 pt-2">
              
              <a href="https://www.facebook.com/share/1KKR8xPnUT/?mibextid=wwXIfr" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@damal.so?_r=1&_t=ZS-95TYWl4fZI8" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.72.42-1.14 1.16-1.31 1.97-.03.52.12 1.04.42 1.47.53.76 1.48 1.14 2.39 1.01.99-.08 1.84-.81 2.04-1.78.18-.8.15-1.63.13-2.42 0-3.62.01-7.24 0-10.86z"/></svg>
              </a>
              <a href="https://wa.me/252613052542" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-8 md:pl-10">
            <h3 className="text-[17px] font-bold tracking-wide uppercase">Quick Links</h3>
            <ul className="flex flex-col gap-5">
              {[
                { name: "HOME", href: "/" },
                { name: "ABOUT", href: "/about" },
                { name: "BUY", href: "/buy" },
                { name: "RENT", href: "/rent" },
                { name: "CONTACT", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-[13px] font-bold tracking-widest leading-none">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-8">
            <h3 className="text-[17px] font-bold tracking-wide uppercase">Contact</h3>
            <div className="flex flex-col gap-5">
              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[#eae1d2]">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                   <a href="tel:+252613052542" className="text-gray-400 hover:text-white transition-colors text-[14px] font-medium">+252 613052542</a>
                </div>
              </div>
              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[#eae1d2]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                   <span className="text-gray-400 text-[14px] font-medium">HQ Digfeer, Mogadishu</span>
                </div>
              </div>
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[#eae1d2]">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                   <a href="mailto:imustaqbalproperties@gmail.com" className="text-gray-400 hover:text-white transition-colors text-[14px] font-medium break-all">imustaqbalproperties@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Divider */}
      <div className="border-t border-white/10 w-full" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Bottom Bar */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-gray-400 font-medium">
          <p>
            Copyright © {new Date().getFullYear()}{" "} Damal Property. All rights reserved.
          </p>
          <p>
            Powered by Raadsan Teach.
          </p>
        </div>
      </div>
    </footer>
  );
}
