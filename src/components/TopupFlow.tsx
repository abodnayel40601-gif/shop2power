import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  CreditCard,
  Wallet,
  Smartphone,
  HelpCircle,
  Loader2,
  KeyRound,
  ShieldCheck,
  Check
} from "lucide-react";
import { Game, Package, PaymentMethod, Country, TRANSLATIONS, Language } from "../types";
import { PACKAGES, PAYMENT_METHODS, getMockGamerName } from "../data";

interface TopupFlowProps {
  game: Game;
  language: Language;
  country: Country;
  onCompletePurchase: (
    amount: number,
    bonus: number,
    priceUSD: number,
    paymentMethodId: string,
    playerId: string,
    playerUsername: string
  ) => void;
  onBack: () => void;
}

export default function TopupFlow({
  game,
  language,
  country,
  onCompletePurchase,
  onBack,
}: TopupFlowProps) {
  const isAr = language === "ar";
  const t = TRANSLATIONS[language];

  // States
  const [playerId, setPlayerId] = useState("");
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState("");
  const [idError, setIdError] = useState<string | null>(null);

  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "otp" | "success">("form");

  // Payment Form States
  const [voucherCode, setVoucherCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [fawryCode, setFawryCode] = useState("");

  const [showHelpModal, setShowHelpModal] = useState(false);

  // Filter packages for this game
  const gamePackages = PACKAGES.filter((p) => p.gameId === game.id);

  // Selected details helpers
  const selectedPackage = gamePackages.find((p) => p.id === selectedPackageId);
  const selectedPaymentMethod = PAYMENT_METHODS.find((pm) => pm.id === selectedPaymentMethodId);

  // Auto-set first package
  useEffect(() => {
    if (gamePackages.length > 0) {
      setSelectedPackageId(gamePackages[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  // Handle Player ID Verification
  const handleVerifyId = () => {
    if (!playerId.trim()) {
      setIdError(isAr ? "يرجى إدخال معرف اللاعب أولاً" : "Please enter Player ID first");
      return;
    }

    if (!game.idRegex.test(playerId.trim())) {
      setIdError(t.invalidId);
      return;
    }

    setIdError(null);
    setIsVerifyingId(true);

    setTimeout(() => {
      setIsVerifyingId(false);
      setIsIdVerified(true);
      setVerifiedUsername(getMockGamerName(playerId));
    }, 1200);
  };

  // Convert USD price to local currency
  const getLocalPrice = (usdPrice: number) => {
    return (usdPrice * country.exchangeRate).toFixed(2);
  };

  // Total calculations
  const baseLocalPrice = selectedPackage ? parseFloat(getLocalPrice(selectedPackage.priceUSD)) : 0;
  const paymentFee = selectedPaymentMethod
    ? parseFloat(((baseLocalPrice * selectedPaymentMethod.feePercent) / 100).toFixed(2))
    : 0;
  const finalLocalPrice = (baseLocalPrice + paymentFee).toFixed(2);

  // Open Checkout Modal
  const handleCheckoutClick = () => {
    if (!isIdVerified) {
      setIdError(isAr ? "يرجى التحقق من معرف اللاعب أولاً!" : "Please verify your Player ID first!");
      return;
    }
    if (!selectedPackageId) return;
    if (!selectedPaymentMethodId) {
      alert(isAr ? "يرجى اختيار طريقة الدفع أولاً!" : "Please select a payment method first!");
      return;
    }

    // Custom simulators based on payment selection
    if (selectedPaymentMethodId === "fawry") {
      // Generate a random Fawry ref code
      setFawryCode(Math.floor(1000000000 + Math.random() * 9000000000).toString());
    }

    setPaymentStep("form");
    setIsCheckoutModalOpen(true);
  };

  // Simulate Payment Progress
  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      if (selectedPaymentMethodId === "vodafone_cash" && paymentStep === "form") {
        setIsProcessingPayment(false);
        setPaymentStep("otp");
      } else {
        setIsProcessingPayment(false);
        setPaymentStep("success");
        if (selectedPackage) {
          onCompletePurchase(
            selectedPackage.amount,
            selectedPackage.bonus,
            selectedPackage.priceUSD,
            selectedPaymentMethodId,
            playerId,
            verifiedUsername
          );
        }
      }
    }, 1800);
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Back to games list */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition"
      >
        <ArrowLeft className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
        <span>{isAr ? "الرجوع لقائمة الألعاب" : "Back to Games"}</span>
      </button>

      {/* Game Header Panel */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-50" />
        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          <img
            src={game.image}
            alt={isAr ? game.nameAr : game.nameEn}
            referrerPolicy="no-referrer"
            className="h-16 w-24 object-cover rounded-xl border border-slate-100 shadow-sm"
          />
          <div className="text-center sm:text-right flex-1 space-y-1">
            <h2 className="text-xl font-black text-slate-900">{isAr ? game.nameAr : game.nameEn}</h2>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t.secureServer}</span>
            </p>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full px-4 py-2 text-xs font-bold transition"
          >
            <HelpCircle className="h-4 w-4 text-indigo-600" />
            <span>{t.howToFindId}</span>
          </button>
        </div>
      </div>

      {/* 2-Column layout: Step 1,2,3 on left/right, summary on right/left */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Enter Player ID */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-600 font-mono text-[10px] font-bold">1</span>
              <span>{t.enterPlayerId}</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={game.idPlaceholder}
                  value={playerId}
                  onChange={(e) => {
                    setPlayerId(e.target.value);
                    setIsIdVerified(false);
                    setIdError(null);
                  }}
                  disabled={isVerifyingId}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-base md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 font-mono transition"
                />
                {isIdVerified && (
                  <Check className={`absolute top-4.5 h-4 w-4 text-emerald-600 ${isAr ? "left-4" : "right-4"}`} />
                )}
              </div>
              <button
                onClick={handleVerifyId}
                disabled={isVerifyingId || !playerId}
                className="rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-300 text-white text-xs font-bold px-6 py-3.5 transition flex items-center justify-center gap-1.5"
              >
                {isVerifyingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t.verifying}</span>
                  </>
                ) : (
                  <span>{t.verifyId}</span>
                )}
              </button>
            </div>

            {/* Error Message */}
            {idError && (
              <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{idError}</span>
              </div>
            )}

            {/* Verified Username Box */}
            {isIdVerified && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <UserCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-mono leading-none">{t.verifiedAs}</span>
                    <span className="block text-sm font-black text-emerald-855 mt-1 font-sans">{verifiedUsername}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded bg-emerald-100 text-[9px] font-black tracking-wider uppercase text-emerald-800 px-2 py-1">
                  <span>{t.verifiedGamer}</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Select Package */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-600 font-mono text-[10px] font-bold">2</span>
              <span>{t.selectPackage}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gamePackages.map((pack) => {
                const isSelected = selectedPackageId === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPackageId(pack.id)}
                    className={`relative overflow-hidden rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {/* Package Badge */}
                    {pack.badgeAr && (
                      <span className={`absolute top-0 text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-bl-lg rounded-tr-lg ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                      } ${isAr ? "left-0" : "right-0"}`}>
                        {isAr ? pack.badgeAr : pack.badgeEn}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-slate-900 font-mono">{pack.amount}</span>
                          <span className="text-xs text-slate-500">{isAr ? game.currencyAr : game.currencyEn}</span>
                        </div>
                        {pack.bonus > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <Sparkles className="h-3 w-3" />
                            <span>+{pack.bonus} {isAr ? t.bonus : "Bonus"}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-black text-indigo-600 font-mono">
                          {getLocalPrice(pack.priceUSD)} {country.currencyAr}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                          ~ ${(pack.priceUSD).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Select Payment Method */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-600 font-mono text-[10px] font-bold">3</span>
              <span>{t.selectPayment}</span>
            </h3>

            <div className="space-y-3">
              {/* Standard options */}
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedPaymentMethodId === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPaymentMethodId(pm.id)}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        {pm.id === "garena_voucher" && <KeyRound className="h-5 w-5" />}
                        {pm.id === "vodafone_cash" && <Wallet className="h-5 w-5" />}
                        {pm.id === "fawry" && <Smartphone className="h-5 w-5" />}
                        {pm.id === "credit_card" && <CreditCard className="h-5 w-5" />}
                        {pm.id === "sms" && <Smartphone className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{isAr ? pm.nameAr : pm.nameEn}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{isAr ? pm.descriptionAr : pm.descriptionEn}</p>
                      </div>
                    </div>
                    {pm.feePercent > 0 && (
                      <div className="text-right shrink-0">
                        <span className="block text-[9px] text-slate-400">{t.fees}</span>
                        <span className="block text-xs font-bold text-slate-600 font-mono">+{pm.feePercent}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Order Checkout Summary */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              {t.checkoutSummary}
            </h3>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">{t.game}</span>
                <span className="font-bold text-slate-900">{isAr ? game.nameAr : game.nameEn}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">{t.playerId}</span>
                <span className="font-mono text-slate-900 font-bold">{playerId || "—"}</span>
              </div>

              {isIdVerified && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">{t.playerName}</span>
                  <span className="font-bold text-emerald-600">{verifiedUsername}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">{t.packageSelected}</span>
                {selectedPackage ? (
                  <span className="font-black text-slate-900 font-mono">
                    {selectedPackage.amount} + {selectedPackage.bonus} {isAr ? game.currencyAr : game.currencyEn}
                  </span>
                ) : (
                  <span>—</span>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">{t.subtotal}</span>
                  <span className="font-mono font-bold">
                    {selectedPackage ? `${getLocalPrice(selectedPackage.priceUSD)} ${country.currencyAr}` : "0"}
                  </span>
                </div>

                {paymentFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">{t.fees}</span>
                    <span className="font-mono font-bold text-rose-600">
                      +{paymentFee.toFixed(2)} {country.currencyAr}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black">
                  <span className="text-slate-900">{t.total}</span>
                  <span className="text-indigo-600 font-mono font-black text-base">
                    {selectedPackage ? `${finalLocalPrice} ${country.currencyAr}` : `0 ${country.currencyAr}`}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={
                !isIdVerified ||
                !selectedPackageId ||
                !selectedPaymentMethodId
              }
              className="w-full rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 text-white disabled:text-slate-300 py-3.5 text-xs font-bold transition shadow-sm"
              id="confirm-checkout-btn"
            >
              {t.payNow}
            </button>
          </div>
        </div>
      </div>

      {/* HELP MODAL: How to find Player ID */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-600" />
              <span>{t.howToFindId}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {game.id === "freefire" && t.freeFireIdHelp}
              {game.id === "pubg" && t.pubgIdHelp}
              {game.id === "roblox" && t.robloxIdHelp}
              {game.id === "mlbb" && t.mlbbIdHelp}
              {game.id === "codm" && (isAr ? "افتح لعبة Call of Duty Mobile، اضغط على صورتك في أعلى اليسار، ثم اختر تبويب 'Profile'، ستجد الـ UID الخاص بك كاملاً." : "Open CoD Mobile, tap your player profile on top left, select the 'Profile' tab, and copy your full UID.")}
            </p>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full rounded-xl bg-slate-900 hover:bg-indigo-600 py-2.5 text-xs font-bold text-white transition"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT PROCESSOR MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-2xl text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">{t.checkoutTitle}</h3>
              </div>
              <button
                onClick={() => {
                  if (!isProcessingPayment) setIsCheckoutModalOpen(false);
                }}
                disabled={isProcessingPayment}
                className="text-slate-400 hover:text-slate-800 transition disabled:opacity-50"
              >
                <ArrowLeft className={`h-5 w-5 ${isAr ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* FORM STEP */}
            {paymentStep === "form" && (
              <form onSubmit={handleCompletePayment} className="space-y-4">
                {/* Method Info Badge */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                  <span className="block text-[9px] text-slate-450 font-mono uppercase tracking-wider font-bold">
                    {isAr ? "وسيلة الدفع النشطة" : "Active Gateway"}
                  </span>
                  <span className="block text-xs font-bold text-slate-850">
                    {isAr ? selectedPaymentMethod?.nameAr : selectedPaymentMethod?.nameEn}
                  </span>
                </div>

                {/* Simulated payment inputs based on selected gateway */}
                {selectedPaymentMethodId === "garena_voucher" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">{isAr ? "رقم كود البطاقة (PIN)" : "Card PIN Code"}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.voucherInputPlaceholder}
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-base md:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 font-mono text-center tracking-widest"
                    />
                    <span className="block text-[10px] text-slate-400 text-center">
                      {isAr ? "أدخل أي 16 رقماً لمحاكاة الشحن الناجح" : "Enter any 16 digits to simulate successful recharge"}
                    </span>
                  </div>
                )}

                {(selectedPaymentMethodId === "vodafone_cash" || selectedPaymentMethodId === "sms") && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">{isAr ? "رقم الهاتف المحمول" : "Mobile Phone Number"}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.phoneInputPlaceholder}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-base md:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 font-mono text-center tracking-wider"
                    />
                    <span className="block text-[10px] text-slate-400 text-center">
                      {isAr ? "أدخل رقم هاتفك لتلقي كود التحقق OTP (محاكاة)" : "Enter your phone to receive simulated OTP code"}
                    </span>
                  </div>
                )}

                {selectedPaymentMethodId === "fawry" && (
                  <div className="space-y-4 text-center py-2">
                    <div className="space-y-1 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">{isAr ? "كود دفع فوري المرجعي" : "Fawry Pay Reference Code"}</span>
                      <span className="block text-xl font-black text-indigo-600 font-mono tracking-widest select-all">{fawryCode}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      {t.fawryInstructions}
                    </p>
                  </div>
                )}

                {selectedPaymentMethodId === "credit_card" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">{isAr ? "بيانات بطاقة الدفع" : "Card Information"}</label>
                      <input
                        type="text"
                        required
                        placeholder={t.cardNoPlaceholder}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-base md:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 font-mono text-center tracking-widest"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <input
                          type="text"
                          required
                          placeholder={t.cardExpiryPlaceholder}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 text-base md:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 font-mono text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <input
                          type="password"
                          required
                          placeholder={t.cardCvvPlaceholder}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 text-base md:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 font-mono text-center tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 text-white disabled:text-slate-300 py-3.5 text-xs font-bold transition flex items-center justify-center gap-2 mt-6"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t.simulatingPayment}</span>
                    </>
                  ) : selectedPaymentMethodId === "fawry" ? (
                    <span>{t.fawryPaidBtn}</span>
                  ) : (
                    <span>{t.completePayment}</span>
                  )}
                </button>
              </form>
            )}

            {/* OTP VERIFICATION STEP (ONLY for Vodafone Cash / Mobile Wallet) */}
            {paymentStep === "otp" && (
              <form onSubmit={handleCompletePayment} className="space-y-5 text-center py-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">{isAr ? "أدخل كود التحقق (OTP)" : "Enter OTP Verification Code"}</h4>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? `تم إرسال كود مكون من 4 أرقام إلى الهاتف ${phoneNumber}`
                      : `A 4-digit verification code was sent to ${phoneNumber}`}
                  </p>
                </div>

                <div className="max-w-[200px] mx-auto">
                  <input
                    type="text"
                    required
                    placeholder="— — — —"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-lg font-bold text-slate-800 text-center focus:outline-none focus:border-indigo-600 font-mono tracking-[1.2em]"
                  />
                </div>

                <span className="block text-[10px] text-slate-400">
                  {isAr ? "أدخل أي 4 أرقام للمحاكاة وتأكيد العملية" : "Enter any 4 numbers to simulate and confirm the transaction"}
                </span>

                <button
                  type="submit"
                  disabled={isProcessingPayment || otpCode.length < 4}
                  className="w-full rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 text-white disabled:text-slate-300 py-3.5 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t.simulatingPayment}</span>
                    </>
                  ) : (
                    <span>{isAr ? "تأكيد والبدء بالشحن" : "Verify & Recharge Account"}</span>
                  )}
                </button>
              </form>
            )}

            {/* SUCCESS CONFIRMATION STEP */}
            {paymentStep === "success" && (
              <div className="text-center py-6 space-y-5">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-black text-emerald-800">{t.congrats}</h4>
                  <p className="text-sm font-bold text-slate-800">{t.paymentSuccessMsg}</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-2">
                    {t.sentToInbox}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      onBack();
                    }}
                    className="w-full rounded-xl bg-slate-900 hover:bg-indigo-600 py-3 text-xs font-bold text-white transition"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
