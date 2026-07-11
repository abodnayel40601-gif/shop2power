import React from "react";
import { Globe, User, LogOut } from "lucide-react";
import { Language, TRANSLATIONS } from "../types";
import { User as FirebaseUser } from "../firebase";
import Logo from "./Logo";

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onLogoClick?: () => void;
  user: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export default function Header({
  language,
  setLanguage,
  onLogoClick,
  user,
  onLoginClick,
  onLogoutClick,
}: HeaderProps) {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={onLogoClick}>
          <Logo className="h-7 w-auto sm:h-8 md:h-9" />
        </div>

        {/* Right Section Actions (Language Switcher & Auth) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition border border-transparent hover:border-slate-200"
            id="lang-switcher-btn"
          >
            <Globe className="h-3.5 w-3.5 text-indigo-600" />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {/* User Pill */}
              <div 
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 max-w-[150px] sm:max-w-[200px]"
                style={{ direction: language === "ar" ? "rtl" : "ltr" }}
              >
                <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-[9px]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                </div>
                <span className="truncate">{user.displayName || user.email?.split("@")[0]}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogoutClick}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                title={t.logout}
                aria-label={t.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-sm cursor-pointer"
              id="login-btn"
            >
              <User className="h-3.5 w-3.5" />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

