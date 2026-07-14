import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import TopupFlow from "./components/TopupFlow";
import LoginModal from "./components/LoginModal";
import SignInPage from "./components/SignInPage";
import Logo from "./components/Logo";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import { Language, Country, COUNTRIES, TRANSLATIONS } from "./types";
import { GAMES, PAYMENT_METHODS } from "./data";
import {
  ShieldCheck,
  Gamepad2,
  Sparkles,
  Ticket,
  CreditCard,
  Search,
  MessageSquare,
  Check,
  Loader2,
  Send,
  FileSearch,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Copy,
  Plus,
  HelpCircle,
  QrCode,
  Smartphone
} from "lucide-react";
import { auth, onAuthStateChanged, signOut } from "./firebase";

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("s2p_language");
    return (saved as Language) || "ar";
  });
  const [selectedCountry] = useState<Country>(COUNTRIES[0]); // EG default
  const [selectedGameId, setSelectedGameId] = useState<string | null>(() => {
    return localStorage.getItem("s2p_selected_game_id") || null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("s2p_active_tab") || "home";
  });
  
  const [currentView, setCurrentView] = useState<"home" | "signin">(() => {
    const saved = localStorage.getItem("s2p_current_view");
    if (saved === "home" || saved === "signin") {
      return saved as "home" | "signin";
    }
    const hash = window.location.hash;
    const path = window.location.pathname;
    if (hash === "#/signin" || hash === "#signin" || path.endsWith("/signin") || path.endsWith("/signin/")) {
      return "signin";
    }
    return "home";
  });

  // Save navigation states to localStorage
  useEffect(() => {
    localStorage.setItem("s2p_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("s2p_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedGameId) {
      localStorage.setItem("s2p_selected_game_id", selectedGameId);
    } else {
      localStorage.removeItem("s2p_selected_game_id");
    }
  }, [selectedGameId]);

  useEffect(() => {
    localStorage.setItem("s2p_current_view", currentView);
  }, [currentView]);

  // Interactive Feature States
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Order Tracking States
  const [trackingId, setTrackingId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Chat Support Assistant States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      sender: "bot",
      textAr: "مرحباً بك في مركز دعم شوب تو باور! أنا مساعدك الفوري. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن مواعيد الشحن، طرق الدفع المتاحة، أو كيفية تتبع طلبك.",
      textEn: "Welcome to Shop2Power Support! I'm your instant assistant. How can I help you today? Ask me about delivery speed, available payment methods, or tracking your order.",
      time: "10:00"
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedGame = GAMES.find((g) => g.id === selectedGameId);
  const isAr = language === "ar";
  const t = TRANSLATIONS[language];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotTyping]);

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
    const savedFallback = localStorage.getItem("fallback_user");
    if (savedFallback) {
      try {
        setUser(JSON.parse(savedFallback));
      } catch (e) {
        console.error("Failed to parse fallback user:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem("fallback_user");
      } else {
        if (!localStorage.getItem("fallback_user")) {
          setUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem("fallback_user");
      await signOut(auth);
      setUser(null);
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
    // Generate a beautiful mock receipt for tracking later
    const newInvoiceId = "S2P-" + Math.floor(100000 + Math.random() * 900000) + "-EG";
    const newOrder = {
      invoiceId: newInvoiceId,
      gameNameAr: selectedGame?.nameAr,
      gameNameEn: selectedGame?.nameEn,
      gameImage: selectedGame?.image,
      playerId,
      playerUsername,
      amount,
      bonus,
      price: (priceUSD * selectedCountry.exchangeRate).toFixed(2),
      currency: selectedCountry.currencyAr,
      status: "SUCCESS",
      date: new Date().toLocaleString()
    };

    // Save order in localStorage for tracking simulator
    const pastOrders = JSON.parse(localStorage.getItem("s2p_orders") || "[]");
    pastOrders.unshift(newOrder);
    localStorage.setItem("s2p_orders", JSON.stringify(pastOrders));

    // Also auto-fill tracking ID for a friendly post-purchase surprise
    setTrackingId(newInvoiceId);
  };

  // Tracking Simulator
  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsTracking(true);
    setTrackingError(null);
    setTrackingResult(null);

    setTimeout(() => {
      setIsTracking(false);
      const pastOrders = JSON.parse(localStorage.getItem("s2p_orders") || "[]");
      const foundOrder = pastOrders.find(
        (o: any) => o.invoiceId.trim().toLowerCase() === trackingId.trim().toLowerCase()
      );

      if (foundOrder) {
        setTrackingResult(foundOrder);
      } else {
        // Fallback simulated tracking for interactive fun if they type random ID
        if (trackingId.length >= 6) {
          setTrackingResult({
            invoiceId: trackingId.toUpperCase(),
            gameNameAr: "شحن عام (معتمد)",
            gameNameEn: "Global Recharge (Verified)",
            playerId: "7483921948",
            playerUsername: "々LEGEND_PLAYER々",
            amount: 530,
            bonus: 53,
            price: "190.00",
            currency: "جنيه",
            status: "SUCCESS",
            date: new Date().toLocaleString()
          });
        } else {
          setTrackingError(
            isAr
              ? "لم يتم العثور على الفاتورة. يرجى إدخال كود صحيح مثل (S2P-123456-EG)"
              : "Invoice not found. Please enter a valid ID like (S2P-123456-EG)"
          );
        }
      }
    }, 1200);
  };

  // Promo Code Activation
  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoStatus("loading");

    setTimeout(() => {
      const code = promoCode.trim().toUpperCase();
      if (code === "SHOP2POWER" || code === "GARENA50" || code === "FREE99" || code === "POWER2026") {
        setPromoStatus("success");
        setPromoMessage(
          isAr
            ? `تهانينا! تم تفعيل الكود بنجاح. تم إضافة 150 شيلز مجانية إلى حسابك ورصيد محفظتك!`
            : `Congratulations! Code active. 150 Garena Shells added to your wallet successfully!`
        );
      } else {
        setPromoStatus("error");
        setPromoMessage(
          isAr
            ? "عفواً، الكود المدخل غير صحيح أو انتهت صلاحيته."
            : "Sorry, this promo code is invalid or has expired."
        );
      }
    }, 1000);
  };

  // Copy helper
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Chat BOT responses
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      id: chatMessages.length + 1,
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const userPrompt = chatInput;
    const query = chatInput.toLowerCase();
    setChatInput("");
    setIsBotTyping(true);

    try {
      // Map current messages for Gemini history
      const history = chatMessages.slice(-15).map(msg => ({
        text: msg.sender === 'user' ? msg.text : (isAr ? msg.textAr : msg.textEn),
        sender: msg.sender
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userPrompt,
          history
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsBotTyping(false);

        if (data && data.text) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              sender: "bot",
              textAr: data.text,
              textEn: data.text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not retrieve AI response from server, falling back to secure local responses:", err);
    }

    // Graceful Fallback if Server or Gemini API is not configured
    setTimeout(() => {
      setIsBotTyping(false);
      let botTextAr = "";
      let botTextEn = "";

      if (query.includes("شحن") || query.includes("جواهر") || query.includes("شدات") || query.includes("recharge") || query.includes("gems")) {
        botTextAr = "لإجراء عملية الشحن، تفضل باختيار اللعبة المطلوبة من الصفحة الرئيسية، ثم أدخل الـ ID الخاص بك واضغط على 'تحقق من المعرف' لتأكيد حسابك، ثم اختر الباقة المفضلة وطريقة الدفع لتبدأ عملية الشحن فوراً!";
        botTextEn = "To recharge, select your game from the homepage, enter your Player ID and click 'Verify ID', then select your package and preferred payment method to start instant delivery!";
      } else if (query.includes("دفع") || query.includes("فودافون") || query.includes("فوري") || query.includes("payment") || query.includes("cash")) {
        botTextAr = "نوفر لك أفضل طرق الدفع المحلية كاش والمحافظ الإلكترونية (فودافون، أورانج، اتصالات)، فوري كود دفع مرجعي فوري، بطاقات الائتمان فيزا وماستركارد، وشحن الرصيد مباشرة بضمان معتمد.";
        botTextEn = "We offer the best secure local payments: Vodafone Cash and all mobile wallets, Fawry reference payment code, Visa / Mastercard credit cards, and direct carrier billing options.";
      } else if (query.includes("تتبع") || query.includes("طلب") || query.includes("وين") || query.includes("track") || query.includes("where")) {
        botTextAr = "يمكنك تتبع طلبك بكل سهولة! اضغط على زر 'تتبع الطلبات' الموجود في القائمة الجانبية باليمين، ثم أدخل رقم الفاتورة الخاص بك (مثال: S2P-123456-EG) لتشاهد التقرير المباشر لحالة إرسال الجواهر.";
        botTextEn = "Track your order instantly! Click on the 'Track Orders' button in the right sidebar, and enter your Invoice ID (e.g., S2P-123456-EG) to see real-time dispatch progress.";
      } else {
        botTextAr = "طلبك مجاب بكل سرور! نظامنا يعمل بشكل آلي 100% ومعتمد رسمياً من Garena لخدمة منطقة الشرق الأوسط وشمال أفريقيا، ستصلك باقة الشحن الخاصة بك ببريد اللعبة خلال 2 دقيقة فقط.";
        botTextEn = "Happy to assist you! Our server is 100% automated and officially authorized by Garena to serve the MENA region. Recharged items will arrive in your game mailbox within 2 minutes.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "bot",
          textAr: botTextAr,
          textEn: botTextEn,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  // Filtering games
  const filteredGames = GAMES.filter((game) => {
    const name = isAr ? game.nameAr : game.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (currentView === "signin") {
    return (
      <div className="min-h-screen bg-[#080c14]" dir={isAr ? "rtl" : "ltr"}>
        <SignInPage
          language={language}
          onBack={() => {
            setCurrentView("home");
            window.location.hash = "";
          }}
          onUserUpdate={(u) => setUser(u)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] font-sans text-slate-100 selection:bg-[#00f2fe] selection:text-[#080c14] relative overflow-x-hidden">
      
      {/* Decorative Cyber Glowing Orbs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-15">
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-[#00f2fe]/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-[15%] right-[-15%] w-[600px] h-[600px] bg-[#0072ff]/40 rounded-full blur-[140px]" />
        <div className="absolute top-[50%] left-[30%] w-[400px] h-[400px] bg-[#818cf8]/20 rounded-full blur-[120px]" />
      </div>

      {/* Header component */}
      {currentView !== "signin" && (
        <Header
          language={language}
          setLanguage={setLanguage}
          onLogoClick={() => {
            setSelectedGameId(null);
            setActiveTab("home");
            setCurrentView("home");
            window.location.hash = "";
          }}
          user={user}
          onLoginClick={() => {
            setCurrentView("signin");
            window.location.hash = "#/signin";
          }}
          onLogoutClick={handleLogout}
          activeTab={selectedGameId ? "games" : activeTab}
          onTabChange={(tab) => {
            setSelectedGameId(null);
            setActiveTab(tab);
            setCurrentView("home");
            window.location.hash = "";
          }}
        />
      )}

      {/* Main layout container wrapper */}
      <main className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:pb-28 md:pb-8 sm:px-6 lg:px-8 relative z-10" dir={isAr ? "rtl" : "ltr"}>
        <div className="space-y-8">
          
          {selectedGame ? (
            /* Selected Game Top-Up Flow with absolute dark mode override wrapper */
            <div className="dark-theme-override">
              <TopupFlow
                game={selectedGame}
                language={language}
                country={selectedCountry}
                onCompletePurchase={handleCompletePurchase}
                onBack={() => setSelectedGameId(null)}
              />
            </div>
          ) : (
            /* Main Dashboard Views */
            <div className="max-w-5xl mx-auto space-y-8">
              
              {/* MAIN CONTENT COLS (Full width & Centered) */}
              <div className="space-y-8">
                
                {/* 1. HOME TAB */}
                {activeTab === "home" && (
                  <div className="space-y-8">
                    
                    {/* Visual Hero Block matching screenshot branding perfectly */}
                    <div className="text-center py-6 space-y-4">
                      
                      {/* Giant Central Shop2Power Logo */}
                      <div className="inline-block relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#00f2fe] to-[#0072ff] rounded-full opacity-25 blur-xl animate-pulse" />
                        <Logo className="h-28 w-auto mx-auto relative drop-shadow-[0_0_35px_rgba(0,242,254,0.45)]" hideText={true} />
                      </div>

                      {/* Brand Titles */}
                      <div className="space-y-2">
                        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-[#00f2fe] tracking-tight uppercase">
                          Shop2Power
                        </h1>
                        <p className="text-xl sm:text-2xl font-black text-[#00f2fe]">
                          {isAr ? "Shop2Power: بوابة شحن الألعاب الأقوى!" : "Shop2Power: The Strongest Game Top-Up Gateway!"}
                        </p>
                        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
                          {isAr ? "اشحن جواهرك، شداتك، ونقاطك فوراً وبأمان بأسعار معتمدة رسمياً." : "Recharge your gems, UC, and gaming credits instantly and safely."}
                        </p>
                      </div>

                      {/* Giant Futuristic Central Search Input */}
                      <div className="pt-4 max-w-md mx-auto relative">
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                          <Search className="h-5 w-5 text-[#00f2fe]" />
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder={t.searchPlaceholder}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-full bg-[#121926]/75 backdrop-blur border border-[#212d45] focus:border-[#00f2fe]/60 text-white placeholder-slate-500 px-12 py-3.5 text-center focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(0,242,254,0.15)] font-bold text-sm"
                        />
                      </div>
                    </div>

                    {/* Game Grid selection header */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-[#1d273a] pb-4">
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                            <Gamepad2 className="h-5 w-5 text-[#00f2fe]" />
                            <span>{isAr ? "اختر لعبتك للبدء بالشحن" : "Select Your Game To Begin"}</span>
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {isAr ? "نوفر شحن آمن وفوري ومباشر بمعرف اللاعب الخاص بك" : "Direct secure top-up powered by official integration with your UID"}
                          </p>
                        </div>
                      </div>

                      {/* Horizontal Game Directory Grid */}
                      {filteredGames.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        <div className="text-center py-16 rounded-2xl border border-[#212d45] bg-[#111824] p-6 shadow-sm">
                          <p className="text-xs text-slate-400">
                            {isAr ? "عفواً! لم يتم العثور على ألعاب مطابقة لبحثك." : "No games matching your search criteria."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. SUPPORT GAMES LIST TAB */}
                {activeTab === "games" && (
                  <div className="space-y-6">
                    <div className="bg-[#101726]/80 p-6 rounded-3xl border border-[#212d45] space-y-4">
                      <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                        <Gamepad2 className="h-5.5 w-5.5 text-[#00f2fe]" />
                        <span>{isAr ? "بوابة الألعاب المدعومة للشحن الفوري" : "Supported Game Gateways"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {isAr
                          ? "شوب تو باور هي الوكيل الرسمي والمعتمد لإرسال الجواهر والاعتمادات والشدات لأشهر الألعاب العالمية. يتم الشحن آلياً فور الدفع عبر أنظمتنا المشفرة بالكامل."
                          : "Shop2Power is the official merchant partner for diamond, UC and item delivery. Recharges are completely automated via secure endpoints."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {GAMES.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          language={language}
                          onSelect={(g) => setSelectedGameId(g.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. OFFERS / PROMO CODE REDEMPTION TAB */}
                {activeTab === "offers" && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-[#101726]/85 p-6 rounded-3xl border border-[#212d45] space-y-3">
                      <span className="inline-flex items-center gap-1.5 bg-[#00f2fe]/10 text-[#00f2fe] text-[10px] font-black px-2.5 py-1 rounded-md">
                        <Ticket className="h-3.5 w-3.5" />
                        <span>{isAr ? "مركز استبدال الأكواد" : "Redeem Promo Center"}</span>
                      </span>
                      <h2 className="text-xl font-black text-white">{isAr ? "مركز الهدايا وتفعيل الكوبونات" : "Redeem Gift and Promo Codes"}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {isAr
                          ? "أدخل كوبون خصم شوب تو باور أو كود هدية جارينا لتلقي بونص شيلز مجاني فوراً في محفظتك."
                          : "Enter any Shop2Power coupon, offer, or Garena code to unlock free wallet credits or gems."}
                      </p>
                    </div>

                    {/* Form and coupon list inside dynamic cols */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Code Input Card */}
                      <div className="md:col-span-2 bg-[#121926]/90 p-5 rounded-3xl border border-[#212d45] space-y-4">
                        <h3 className="text-sm font-black text-white">{isAr ? "تفعيل كود ترويجي جديد" : "Redeem A New Promo Code"}</h3>
                        
                        <form onSubmit={handlePromoSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              required
                              placeholder={isAr ? "أدخل الكود هنا (مثال: SHOP2POWER)" : "Enter promo code (e.g., SHOP2POWER)"}
                              value={promoCode}
                              onChange={(e) => {
                                setPromoCode(e.target.value);
                                setPromoStatus("idle");
                              }}
                              className="w-full rounded-xl bg-[#161f30] border border-[#212d45] focus:border-[#00f2fe] px-4 py-3 text-sm text-white focus:outline-none tracking-widest text-center font-bold"
                            />
                            <span className="block text-[10px] text-slate-500 text-center">
                              {isAr ? "استخدم الكود الترويجي الفعال SHOP2POWER للحصول على مكافأتك!" : "Use active promotion code SHOP2POWER to claim your gift!"}
                            </span>
                          </div>

                          <button
                            type="submit"
                            disabled={promoStatus === "loading" || !promoCode.trim()}
                            className="w-full rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:from-[#00f2fe] hover:to-[#00c6ff] text-white py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {promoStatus === "loading" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{isAr ? "جاري تفعيل الكود..." : "Validating promo code..."}</span>
                              </>
                            ) : (
                              <span>{isAr ? "استرداد المكافأة الآن" : "Redeem Code Now"}</span>
                            )}
                          </button>
                        </form>

                        {/* Status Messages */}
                        {promoStatus === "success" && (
                          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs leading-relaxed flex items-start gap-2">
                            <Check className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-400" />
                            <span>{promoMessage}</span>
                          </div>
                        )}
                        {promoStatus === "error" && (
                          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 text-rose-400 text-xs leading-relaxed flex items-start gap-2">
                            <HelpCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-400" />
                            <span>{promoMessage}</span>
                          </div>
                        )}
                      </div>

                      {/* Available Coupons list */}
                      <div className="bg-[#121926]/90 p-5 rounded-3xl border border-[#212d45] space-y-4">
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-[#00f2fe]" />
                          <span>{isAr ? "كوبونات نشطة ومتاحة" : "Available Promo Codes"}</span>
                        </h3>

                        <div className="space-y-3.5">
                          {[
                            { code: "SHOP2POWER", descAr: "كود ترحيبي يعطيك 150 شيلز مجاناً", descEn: "Welcome coupon for free 150 Garena Shells" },
                            { code: "POWER2026", descAr: "خصم إضافي 10% على باقات الألعاب", descEn: "Extra 10% discount on game packages" }
                          ].map((item) => (
                            <div key={item.code} className="p-3 bg-[#162030] rounded-2xl border border-[#212d45] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black text-[#00f2fe] bg-[#1a2c42] px-2.5 py-1 rounded">
                                  {item.code}
                                </span>
                                <button
                                  onClick={() => handleCopy(item.code)}
                                  className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
                                >
                                  {copiedCode === item.code ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span className="text-emerald-400">{isAr ? "تم النسخ" : "Copied"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>{isAr ? "نسخ" : "Copy"}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400">{isAr ? item.descAr : item.descEn}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 4. PAYMENTS METHODS INFO TAB */}
                {activeTab === "payments" && (
                  <div className="min-h-[400px] flex items-center justify-center">
                    {/* Empty page content as requested */}
                  </div>
                )}

                {/* 5. IMMERSIVE CHAT ASSISTANT TAB */}
                {activeTab === "support" && (
                  <div className="space-y-6">
                    <div className="bg-[#101726]/80 p-5 rounded-3xl border border-[#212d45] space-y-2">
                      <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#00f2fe]" />
                        <span>{isAr ? "مساعد الدعم الفني الذكي المعتمد" : "AI Recharging Support Assistant"}</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isAr ? "يمكنك الاستفسار عن طرق الدفع، وسرعة إرسال الطلبات، وحل مشاكل الشحن فوراً." : "Ask about your order status, payment instructions, or item delivery speeds."}
                      </p>
                    </div>

                    {/* Chat container */}
                    <div className="bg-[#121926]/95 border border-[#212d45] rounded-3xl h-[480px] flex flex-col overflow-hidden shadow-2xl relative">
                      
                      {/* Active Status bar */}
                      <div className="bg-[#161f30] px-5 py-3 border-b border-[#212d45] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-black text-white">{isAr ? "الدعم الفني المباشر" : "Direct Customer Support"}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">24/7 ONLINE</span>
                      </div>

                      {/* Message history */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                        {chatMessages.map((msg) => {
                          const isBot = msg.sender === "bot";
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[80%] ${
                                isBot ? (isAr ? "mr-0 ml-auto items-start" : "ml-0 mr-auto items-start") : (isAr ? "ml-0 mr-auto items-end" : "mr-0 ml-auto items-end")
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                  isBot
                                    ? "bg-[#182335] text-slate-200 rounded-tr-none"
                                    : "bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-[#080c14] font-black rounded-tl-none"
                                }`}
                              >
                                {isBot ? (isAr ? msg.textAr : msg.textEn) : msg.text}
                              </div>
                              <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
                                {msg.time}
                              </span>
                            </div>
                          );
                        })}

                        {isBotTyping && (
                          <div className="flex items-center gap-1.5 p-3 bg-[#182335] rounded-2xl rounded-tr-none text-xs text-slate-400 max-w-[100px]">
                            <Loader2 className="h-4 w-4 animate-spin text-[#00f2fe]" />
                            <span>{isAr ? "يكتب..." : "Typing..."}</span>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Message Form */}
                      <form onSubmit={handleSendMessage} className="p-3 bg-[#101726] border-t border-[#212d45] flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={isAr ? "اكتب استفسارك هنا..." : "Type your query here..."}
                          className="flex-1 rounded-xl bg-[#161f30] border border-[#212d45] focus:border-[#00f2fe] px-4 py-3 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#00f2fe] text-[#080c14] hover:bg-white transition duration-200 cursor-pointer"
                        >
                          <Send className="h-4.5 w-4.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      {currentView !== "signin" && (
        <Footer 
          language={language}
          onTrackOrderClick={() => setIsTrackingModalOpen(true)}
        />
      )}

      {/* LOGIN MODAL (auxiliary login overlay) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        language={language}
        onSuccessRegister={() => setSelectedGameId(null)}
        onUserUpdate={(u) => setUser(u)}
      />

      {/* INTERACTIVE POPUP MODAL: ORDER TRACKING SYSTEM */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#212d45] bg-[#111723] p-6 space-y-5 shadow-2xl text-slate-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1d273a] pb-3">
              <div className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-[#00f2fe]" />
                <h3 className="text-sm sm:text-base font-black text-white">{isAr ? "تتبع حالة طلب الشحن الخاص بك" : "Track Your Recharge Order"}</h3>
              </div>
              <button
                onClick={() => {
                  setIsTrackingModalOpen(false);
                  setTrackingResult(null);
                  setTrackingError(null);
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <ArrowRight className={`h-5 w-5 ${isAr ? "" : "rotate-180"}`} />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleTrackOrder} className="flex gap-2.5">
              <input
                type="text"
                required
                placeholder={isAr ? "أدخل رقم الفاتورة (مثال: S2P-9482-EG)" : "Enter Invoice ID (e.g. S2P-9482-EG)"}
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1 rounded-xl bg-[#161f30] border border-[#212d45] focus:border-[#00f2fe] px-4 py-3 text-xs.5 text-white focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isTracking || !trackingId.trim()}
                className="rounded-xl bg-[#00f2fe] hover:bg-white text-[#080c14] font-black px-5 py-3 text-xs.5 transition shrink-0 cursor-pointer"
              >
                {isTracking ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (isAr ? "تتبع" : "Track")}
              </button>
            </form>

            {/* Error view */}
            {trackingError && (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 text-rose-400 text-xs.5 leading-relaxed">
                {trackingError}
              </div>
            )}

            {/* Result view */}
            {trackingResult && (
              <div className="space-y-4 border-t border-[#1d273a] pt-4 animate-fadeIn">
                
                {/* Header status */}
                <div className="flex items-center justify-between rounded-2xl bg-emerald-950/20 border border-emerald-800/30 p-3.5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-400 leading-none">{isAr ? "حالة إرسال الطلب:" : "Delivery Status:"}</span>
                      <span className="block text-xs.5 font-bold text-emerald-400 mt-1">{isAr ? "تم إرسال الشحنة لبريدك بنجاح!" : "Successfully Sent To Inbox!"}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{trackingResult.date}</span>
                </div>

                {/* Grid details */}
                <div className="bg-[#161f2e] border border-[#212d45] rounded-2xl p-4 space-y-3 text-xs.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? "المنتج / اللعبة:" : "Product / Game:"}</span>
                    <span className="font-bold text-white">{isAr ? trackingResult.gameNameAr : trackingResult.gameNameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? "معرف اللاعب (UID):" : "Player ID (UID):"}</span>
                    <span className="font-mono font-bold text-[#00f2fe]">{trackingResult.playerId}</span>
                  </div>
                  {trackingResult.playerUsername && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? "اسم اللاعب المعتمد:" : "Verified Gamer Name:"}</span>
                      <span className="font-bold text-emerald-400">{trackingResult.playerUsername}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? "الكمية والبونص:" : "Quantity & Bonus:"}</span>
                    <span className="font-mono font-black text-white">{trackingResult.amount} + {trackingResult.bonus}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#212d45] pt-3 text-sm font-black text-white">
                    <span>{isAr ? "المجموع المدفوع:" : "Total Paid:"}</span>
                    <span className="text-[#00f2fe] font-mono">{trackingResult.price} {trackingResult.currency || "جنيه"}</span>
                  </div>
                </div>

                <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-2xl p-3 flex items-start gap-2 text-[10px] text-emerald-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <p className="leading-relaxed">
                    {isAr
                      ? "تم الشحن آلياً وتفويضه بالكامل عبر اتصال آمن بمعبر Garena الرسمي لتوزيع الموارد."
                      : "Automatic recharge dispatched and authorized via official secure Garena item distribution network."}
                  </p>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => {
                setIsTrackingModalOpen(false);
                setTrackingResult(null);
                setTrackingError(null);
              }}
              className="w-full rounded-xl bg-[#161f2e] hover:bg-slate-800 py-3 text-xs font-bold text-white border border-[#212d45] transition"
            >
              {isAr ? "إغلاق النافذة" : "Close Window"}
            </button>
          </div>
        </div>
      )}

      {currentView !== "signin" && (
        <BottomNav
          language={language}
          activeTab={selectedGameId ? "games" : activeTab}
          onTabChange={(tab) => {
            setSelectedGameId(null);
            setActiveTab(tab);
            setCurrentView("home");
            window.location.hash = "";
          }}
        />
      )}

    </div>
  );
}
