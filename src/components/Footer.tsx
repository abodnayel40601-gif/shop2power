import React from "react";
import { Facebook, Instagram, ShieldCheck, ArrowUpRight } from "lucide-react";
import Logo from "./Logo";
import { Language } from "../types";

interface FooterProps {
  language: Language;
  onTrackOrderClick: () => void;
}

export default function Footer({ language, onTrackOrderClick }: FooterProps) {
  const isAr = language === "ar";

  // Social Icon SVG: TikTok
  const TikTokIcon = () => (
    <svg className="h-5 w-5 hover:scale-110 transition-transform text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.15 2.27 1.93 3.73 2.18.01 1.25.01 2.5.01 3.75-1.39-.02-2.74-.46-3.88-1.27-.47-.33-.89-.73-1.25-1.19a8.55 8.55 0 01-.13 4.88c-.64 2.19-2.13 4.12-4.14 5.25-2 1.13-4.47 1.34-6.62.58-2.15-.76-3.92-2.43-4.83-4.54-.91-2.11-.84-4.6.19-6.65 1.03-2.05 3-3.48 5.27-3.83.69-.11 1.39-.12 2.08-.02V7.15c-.41-.05-.83-.06-1.25-.01-1.16.14-2.22.75-2.88 1.7-.65.95-.82 2.15-.46 3.25.35 1.1 1.22 1.98 2.32 2.33 1.1.35 2.3.17 3.24-.49.94-.66 1.48-1.74 1.48-2.89 0-3.37.01-6.73.01-10.1l-.01-.01z" />
    </svg>
  );

  // Social Icon SVG: X (Twitter)
  const XIcon = () => (
    <svg className="h-4 w-4 hover:scale-110 transition-transform text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  return (
    <footer className="w-full bg-[#0d1527] border-t border-[#212d45] mt-16 text-slate-300 relative z-10" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Logo, Description, and Payment Partners */}
          <div className="md:col-span-5 flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-auto" hideText={false} />
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              {isAr 
                ? "المتجر الإلكتروني الرائد لشحن الألعاب والبطاقات المفضلة لديك بأمان وسرعة فائقة وبأفضل الأسعار المنافسة عالمياً."
                : "The leading e-commerce store for recharging your favorite games and digital cards securely, at lightning speed, and with the best competitive prices."}
            </p>

            {/* Payment Partners */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAr ? "شركاء الدفع المعتمدون" : "Authorized Payment Partners"}
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-[#121c33] border border-[#212d45] rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-300 flex items-center gap-1 hover:border-[#00f2fe]/40 transition">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isAr ? "فوري" : "Fawry"}
                </span>
                <span className="bg-[#121c33] border border-[#212d45] rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-300 flex items-center gap-1 hover:border-[#00f2fe]/40 transition">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
                  {isAr ? "فودافون كاش" : "Vodafone Cash"}
                </span>
                <span className="bg-[#121c33] border border-[#212d45] rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-300 flex items-center gap-1 hover:border-[#00f2fe]/40 transition font-mono">
                  PayPal
                </span>
                <span className="bg-[#121c33] border border-[#212d45] rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-300 flex items-center gap-1 hover:border-[#00f2fe]/40 transition font-mono">
                  MasterCard
                </span>
                <span className="bg-[#121c33] border border-[#212d45] rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-300 flex items-center gap-1 hover:border-[#00f2fe]/40 transition font-mono">
                  Visa
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider border-b border-[#212d45]/60 pb-2">
              {isAr ? "شركة" : "Company"}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <a href="#home" className="hover:text-[#00f2fe] hover:underline transition decoration-[#00f2fe]/30">
                  {isAr ? "الصفحة الرئيسية" : "Home"}
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  {isAr ? "نبذة عنا" : "About Us"}
                </span>
              </li>
              <li>
                <button onClick={onTrackOrderClick} className="hover:text-[#00f2fe] hover:underline transition decoration-[#00f2fe]/30 text-left">
                  {isAr ? "تتبع الطلبات" : "Track Orders"}
                </button>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  {isAr ? "تواصل معنا" : "Contact Us"}
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  {isAr ? "برنامج التسويق بالعمولة" : "Affiliate Program"}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Policies Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider border-b border-[#212d45]/60 pb-2">
              {isAr ? "مساعدة" : "Help"}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  {isAr ? "سياسة الشحن والتوصيل" : "Shipping Policy"}
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  {isAr ? "سياسة الإرجاع والاسترداد" : "Return & Refund Policy"}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay Connected & Get the App */}
          <div className="md:col-span-3 space-y-5 flex flex-col">
            
            {/* Social Media Links */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                {isAr ? "ابق على اطلاع" : "Stay Informed"}
              </h4>
              <div className="flex items-center gap-3">
                <a href="#" className="h-9 w-9 rounded-full bg-[#121c33] hover:bg-[#00f2fe]/10 border border-[#212d45] flex items-center justify-center text-slate-400 hover:text-[#00f2fe] transition-colors">
                  <TikTokIcon />
                </a>
                <a href="#" className="h-9 w-9 rounded-full bg-[#121c33] hover:bg-[#00f2fe]/10 border border-[#212d45] flex items-center justify-center text-slate-400 hover:text-[#00f2fe] transition-colors">
                  <Instagram className="h-4.5 w-4.5" />
                </a>
                <a href="#" className="h-9 w-9 rounded-full bg-[#121c33] hover:bg-[#00f2fe]/10 border border-[#212d45] flex items-center justify-center text-slate-400 hover:text-[#00f2fe] transition-colors">
                  <XIcon />
                </a>
                <a href="#" className="h-9 w-9 rounded-full bg-[#121c33] hover:bg-[#00f2fe]/10 border border-[#212d45] flex items-center justify-center text-slate-400 hover:text-[#00f2fe] transition-colors">
                  <Facebook className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>



          </div>

        </div>

        {/* Bottom copyright & secure label row */}
        <div className="mt-12 pt-8 border-t border-[#1d273a] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            <span>{isAr ? "© ٢٠٢٦ Shop2Power. كل الحقوق محفوظة." : "© 2026 Shop2Power. All Rights Reserved."}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#00f2fe] bg-[#090f1d] border border-[#212d45] rounded-full px-4 py-2 shadow-inner">
            <ShieldCheck className="h-4.5 w-4.5 text-[#00f2fe]" />
            <span className="font-bold text-slate-300">
              {isAr ? "بوابة شحن آمنة ومعتمدة ١٠٠٪" : "100% Authorized & Secure Checkout Gateway"}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
