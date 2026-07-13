import React from "react";
import { Globe, User, LogOut, Gift, HelpCircle, CreditCard, Gamepad2, Home } from "lucide-react";
import { Language, TRANSLATIONS } from "../types";
import Logo from "./Logo";

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onLogoClick?: () => void;
  user: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({
  language,
  setLanguage,
  onLogoClick,
  user,
  onLoginClick,
  onLogoutClick,
  activeTab = "home",
  onTabChange,
}: HeaderProps) {
  const t = TRANSLATIONS[language];
  const isAr = language === "ar";

  // Menu items based on language
  const menuItems = isAr
    ? [
        { id: "home", label: "الصفحة الرئيسية", icon: Home },
        { id: "games", label: "الألعاب المدعومة", icon: Gamepad2 },
        { id: "offers", label: "العروض", icon: Gift },
        { id: "payments", label: "طرق الدفع", icon: CreditCard },
        { id: "support", label: "دعم العملاء", icon: HelpCircle },
      ]
    : [
        { id: "home", label: "Home", icon: Home },
        { id: "games", label: "Supported Games", icon: Gamepad2 },
        { id: "offers", label: "Offers", icon: Gift },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "support", label: "Customer Support", icon: HelpCircle },
      ];

  const handleMenuClick = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    }
  };

  return (
    <header className="sticky top-0 z-45 w-full border-b border-[#212d45] bg-[#101726]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* RIGHT (Arabic: Left / English: Right) - Brand Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={onLogoClick}>
          <Logo className="h-8 w-auto sm:h-9 md:h-10" />
        </div>

        {/* MIDDLE SECTION - NAVIGATION LINKS (Horizontal Menu) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`relative px-3.5 py-2 text-[13px] font-bold transition-all duration-200 rounded-lg flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#00f2fe] bg-[#1a2538]"
                    : "text-slate-300 hover:text-white hover:bg-[#151f30]"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-[#00f2fe]" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#00f2fe] to-[#0072ff] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* LEFT/RIGHT SECTION ACTIONS (Language, Auth, User profile) */}
        <div className="flex items-center gap-3">
          
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-300 hover:text-[#00f2fe] hover:bg-[#1a2538] rounded-full transition border border-[#212d45] cursor-pointer"
            id="lang-switcher-btn"
          >
            <Globe className="h-3.5 w-3.5 text-[#00f2fe]" />
            <span className="hidden sm:inline">{language === "ar" ? "English" : "العربية"}</span>
            <span className="sm:hidden">{language === "ar" ? "EN" : "AR"}</span>
          </button>

          {/* User Sign In / Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* User Info Pill */}
              <div
                className="flex items-center gap-2 bg-[#1a2538] border border-[#2d3d5a] px-3.5 py-1.5 rounded-full text-xs font-black text-white max-w-[150px] sm:max-w-[200px]"
                style={{ direction: language === "ar" ? "rtl" : "ltr" }}
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#0072ff] text-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-[9px]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="truncate">{user.displayName || user.email?.split("@")[0]}</span>
              </div>

              {/* Logout */}
              <button
                onClick={onLogoutClick}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 rounded-full transition"
                title={t.logout}
                aria-label={t.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 bg-[#151f30] hover:bg-gradient-to-r hover:from-[#00f2fe] hover:to-[#0072ff] text-white border border-[#212d45] hover:border-transparent px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-lg cursor-pointer"
              id="login-btn"
            >
              <User className="h-3.5 w-3.5 text-[#00f2fe]" />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
