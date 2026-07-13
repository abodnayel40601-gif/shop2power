import React from "react";
import { Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Game, Language } from "../types";

interface GameCardProps {
  key?: React.Key;
  game: Game;
  language: Language;
  onSelect: (game: Game) => void;
}

export default function GameCard({ game, language, onSelect }: GameCardProps) {
  const isAr = language === "ar";
  const name = isAr ? game.nameAr : game.nameEn;

  // Dynamically generate subtitle based on game and currency
  const subtitle = isAr
    ? `اشحن ${game.currencyAr} بأفضل الأسعار وأمان تام`
    : `Recharge ${game.currencyEn} with instant delivery`;

  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative overflow-hidden rounded-2xl bg-[#161f2e]/80 hover:bg-[#1a2538] border border-[#243147] hover:border-[#00f2fe]/50 p-3 flex items-center gap-4.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,242,254,0.15)] hover:-translate-y-0.5 cursor-pointer"
      id={`game-card-${game.id}`}
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      {/* Game Image */}
      <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-xl bg-slate-800 shrink-0 border border-[#2d3a52]">
        <img
          src={game.image}
          alt={name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
      </div>

      {/* Content Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00f2fe] font-mono">
            {game.category}
          </span>
          <span className="text-slate-600 text-xs">•</span>
          <div className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold">
            <ShieldCheck className="h-3 w-3" />
            <span>{isAr ? "معتمد" : "Official"}</span>
          </div>
        </div>

        <h3 className="mt-1 text-sm sm:text-base font-black text-white group-hover:text-[#00f2fe] transition duration-200 truncate">
          {name}
        </h3>

        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      {/* Action Arrow Indicator */}
      <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-[#1e2a3f] group-hover:bg-[#00f2fe] text-[#00f2fe] group-hover:text-[#0f172a] transition-all duration-300">
        {isAr ? (
          <ChevronLeft className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
      </div>

      {/* Hover Light Streak effect */}
      <div className="absolute inset-y-0 -left-[100%] w-1/2 bg-gradient-to-r from-transparent via-[#00f2fe]/10 to-transparent skew-x-12 group-hover:animate-shine" />
    </div>
  );
}
