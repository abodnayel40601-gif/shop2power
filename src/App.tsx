import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import TopupFlow from "./components/TopupFlow";
import AiAssistant from "./components/AiAssistant";
import LoginModal from "./components/LoginModal";
import SignInPage from "./components/SignInPage";
import { Language, Country, COUNTRIES, TRANSLATIONS } from "./types";
import { GAMES, PAYMENT_METHODS } from "./data";
import { ShieldCheck, Gamepad2 } from "lucide-react";
import { auth, onAuthStateChanged, signOut, User } from "./firebase";

export default function App() {
  const [language, setLanguage] = useState<Language>("ar");
  const [selectedCountry] = useState<Country>(COUNTRIES[0]); // Default to Egypt (EG) statically, hiding any switcher
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "signin">(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    if (hash === "#/signin" || hash === "#signin" || path.endsWith("/signin") || path.endsWith("/signin/")) {
      return "signin";
    }
    return "home";
  });

  const selectedGame = GAMES.find((g) => g.id === selectedGameId);
  const isAr = language === "ar";
  const t = TRANSLATIONS[language];

  // Listener to handle URL changes in browser address bar (search bar)
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === "#/signin" || hash === "#signin" || path.endsWith("/signin") || path.endsWith("/signin/")) {
        setCurrentView("signin");
      } else {
        setCurrentView("home");
      }
    };
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Handle game recharge completed
  const handleCompletePurchase = (
    amount: number,
    bonus: number,
    priceUSD: number,
    paymentMethodId: string,
    playerId: string,
    playerUsername: string
  ) => {
    console.log("Purchase completed successfully:", {
      amount,
      bonus,
      priceUSD,
      paymentMethodId,
      playerId,
      playerUsername,
    });
  };

  // Filtering games
  const filteredGames = GAMES.filter((game) => {
    const name = isAr ? game.nameAr : game.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-600 selection:text-white pb-16">
      {/* Dynamic Header */}
      {currentView !== "signin" && (
        <Header
          language={language}
          setLanguage={setLanguage}
          onLogoClick={() => {
            setSelectedGameId(null);
            setCurrentView("home");
            window.location.hash = "";
          }}
          user={user}
          onLoginClick={() => {
            setCurrentView("signin");
            window.location.hash = "#/signin";
          }}
          onLogoutClick={handleLogout}
        />
      )}

      {/* Main Container Wrapper with RTL support */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" dir={isAr ? "rtl" : "ltr"}>
        <div className="space-y-8">
          {currentView === "signin" ? (
            <SignInPage
              language={language}
              onBack={() => {
                setCurrentView("home");
                window.location.hash = "";
              }}
              onUserUpdate={(u) => setUser(u)}
            />
          ) : selectedGame ? (
            /* If a game is active, display the custom top-up flow */
            <TopupFlow
              game={selectedGame}
              language={language}
              country={selectedCountry}
              onCompletePurchase={handleCompletePurchase}
              onBack={() => setSelectedGameId(null)}
            />
          ) : (
            /* Otherwise, display the central game directory list */
            <div className="space-y-8">
              {/* Visual Banner Hero Section */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12 shadow-sm">
                {/* Decorative Glowing Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-transparent z-10" />
                <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
                <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

                {/* Representation of game art without external assets */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-slate-800/20 hidden md:block">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-48 h-48 border-4 border-indigo-500 rotate-45"></div>
                    <div className="absolute w-64 h-64 border-2 border-indigo-400 -rotate-12"></div>
                  </div>
                </div>

                <div className="relative max-w-2xl space-y-4 z-20">
                  <span className="inline-block px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded mb-2">
                    {isAr ? "شحن مباشر وفوري" : "Direct Instant Delivery"}
                  </span>

                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight font-sans uppercase">
                    {isAr ? "اشحن جواهر ألعابك المفضلة فوراً وبأمان" : "Recharge your favorite game credits instantly"}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                    {t.appSubtitle} {isAr ? "تلقى شدات وباقات الألعاب مباشرة في حسابك بضغطة زر عبر وسائل دفع محلية آمنة." : "Get UC and game credits inside your inbox. Pay securely with regional channels."}
                  </p>
                </div>
              </div>

              {/* Games Search list Directory */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-indigo-600" />
                      <span>{t.selectGame}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {isAr ? "اختر لعبتك المفضلة لشحن المعرف مباشرة" : "Select your game below to begin direct UID recharge"}
                    </p>
                  </div>

                  <div className="w-full sm:w-72 relative">
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-full bg-white border border-slate-200 px-5 py-3 text-base md:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition shadow-sm"
                    />
                  </div>
                </div>

                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        language={language}
                        onSelect={(g) => setSelectedGameId(g.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs text-slate-400">{isAr ? "عفواً! لم يتم العثور على ألعاب مطابقة لبحثك." : "No games matching your search criteria."}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Corner Chat Assistant */}
      {currentView !== "signin" && <AiAssistant language={language} />}

      {/* Login Modal (fallback/auxiliary) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        language={language}
        onSuccessRegister={() => setSelectedGameId(null)}
        onUserUpdate={(u) => setUser(u)}
      />

      {/* Footer stamp */}
      {currentView !== "signin" && (
        <footer className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-slate-200 text-center space-y-4" dir={isAr ? "rtl" : "ltr"}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <span>{t.allRightsReserved}</span>
            <div className="flex items-center gap-1.5 text-indigo-600/90 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-bold text-slate-700">{isAr ? "بوابة شحن آمنة موثقة 100%" : "100% Certified Safe Checkout Gateway"}</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
