import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
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

  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg cursor-pointer"
      id={`game-card-${game.id}`}
    >
      {/* Popular tag overlay for specific games */}
      {(game.id === "freefire" || game.id === "pubg") && (
        <div className="absolute top-5 left-5 z-10 flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-black tracking-wider px-2.5 py-1 rounded-md shadow-sm">
          <Sparkles className="h-3 w-3" />
          <span>{isAr ? "نشط" : "POPULAR"}</span>
        </div>
      )}

      {/* Game Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
        <img
          src={game.image}
          alt={name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
      </div>

      {/* Content Info */}
      <div className="mt-4 flex flex-col justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
            {game.category}
          </span>
          <span className="text-slate-300 text-xs">•</span>
          <div className="flex items-center gap-0.5 text-emerald-600 text-[10px] font-semibold">
            <ShieldCheck className="h-3 w-3" />
            <span>{isAr ? "شحن آمن" : "Secure"}</span>
          </div>
        </div>

        <h3 className="mt-1 text-base font-black text-slate-900 group-hover:text-indigo-600 transition duration-200">
          {name}
        </h3>

        {/* Action Button */}
        <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 py-3 text-xs font-bold text-white transition-all duration-200">
          <span>{isAr ? "اشحن الآن" : "Recharge Now"}</span>
        </button>
      </div>
    </div>
  );
}
