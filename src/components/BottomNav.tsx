import React from "react";
import { Home, Gamepad2, Gift, CreditCard, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { Language } from "../types";

interface BottomNavProps {
  language: Language;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ language, activeTab, onTabChange }: BottomNavProps) {
  const isAr = language === "ar";

  const tabs = [
    { id: "home", labelAr: "الرئيسية", labelEn: "Home", icon: Home },
    { id: "games", labelAr: "الألعاب", labelEn: "Games", icon: Gamepad2 },
    { id: "offers", labelAr: "العروض", labelEn: "Offers", icon: Gift },
    { id: "payments", labelAr: "الدفع", labelEn: "Payments", icon: CreditCard },
    { id: "support", labelAr: "الدعم", labelEn: "Support", icon: HelpCircle },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0f1d]/90 backdrop-blur-md border-t border-[#1b273d] px-2 py-2.5 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.4)]"
      dir={isAr ? "rtl" : "ltr"}
      id="mobile-bottom-navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const label = isAr ? tab.labelAr : tab.labelEn;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 min-h-[44px] min-w-[56px] select-none cursor-pointer"
              aria-label={label}
            >
              {/* Highlight background glow */}
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-[#00f2fe]/10 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon with glowing effect when active */}
              <div className="relative">
                <Icon
                  className={`h-5.5 w-5.5 transition-all duration-300 ${
                    isActive 
                      ? "text-[#00f2fe] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)] scale-110" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-black mt-1 transition-colors duration-300 ${
                  isActive ? "text-[#00f2fe]" : "text-slate-400"
                }`}
              >
                {label}
              </span>

              {/* Small top active dot */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#00f2fe] shadow-[0_0_6px_rgba(0,242,254,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
