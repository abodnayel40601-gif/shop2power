import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, X, Loader2, Sparkles, LogIn, User, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Language, TRANSLATIONS } from "../types";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  db
} from "../firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccessRegister?: () => void;
  onUserUpdate?: (user: any) => void;
}

export default function LoginModal({ isOpen, onClose, language, onSuccessRegister, onUserUpdate }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Verification, 3: Password
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const t = TRANSLATIONS[language];
  const isAr = language === "ar";

  // Countdown timer for resending verification code
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const resetRegisterFlow = () => {
    setRegisterStep(1);
    setUsername("");
    setEmail("");
    setPassword("");
    setVerificationCodeInput("");
    setGeneratedCode("");
    setTimer(0);
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);
    setError(null);
    setSuccess(null);
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    
    if (!email || !password) {
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const emailLower = email.trim().toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
      const user = userCredential.user;

      // Update last login timestamp in Firestore database asynchronously in background
      setDoc(doc(db, "users", user.uid), {
        email: emailLower,
        displayName: user.displayName || email.split("@")[0],
        provider: "password",
        lastLoginAt: new Date().toISOString()
      }, { merge: true }).catch((dbSaveErr) => {
        console.error("Failed to update last login in database:", dbSaveErr);
      });

      setSuccess(t.loginSuccess);
      setTimeout(() => {
        onClose();
        resetRegisterFlow();
      }, 1000);
    } catch (err: any) {
      console.warn("Authentication issue handled gracefully:", err.code || err.message);
      setEmailError(true);
      setPasswordError(true);
      setError(isAr ? "كلمة المرور التي أدخلتها خاطئة" : "The password you entered is incorrect");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send verification code to email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setUsernameError(false);
    setError(null);

    if (!username.trim()) {
      setUsernameError(true);
      return;
    }

    const emailLower = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailLower || !emailRegex.test(emailLower)) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists in Firestore
      try {
        const q = query(collection(db, "users"), where("email", "==", emailLower));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setEmailError(true);
          setError(isAr ? "هذا الحساب موجود بالفعل" : "This account already exists");
          setLoading(false);
          return;
        }
      } catch (dbErr) {
        console.warn("Could not query Firestore for existing email, proceeding anyway:", dbErr);
      }

      // Generate a 6-digit numeric verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const response = await fetch("/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailLower,
          code,
          username: username.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send code");
      }

      setGeneratedCode(code);
      setTimer(60);
      setRegisterStep(2);
    } catch (err: any) {
      console.warn("Error sending verification code email:", err);
      setEmailError(true);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the input code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verificationCodeInput.trim() === generatedCode) {
      setRegisterStep(3);
    } else {
      setError(isAr ? "رمز التحقق الذي أدخلته غير صحيح" : "The verification code you entered is incorrect");
    }
  };

  // Step 2: Resend code with 60s cooldown
  const handleResendCode = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const emailLower = email.trim().toLowerCase();

      const response = await fetch("/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailLower,
          code,
          username: username.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send code");
      }

      setGeneratedCode(code);
      setTimer(60);
      setVerificationCodeInput("");
    } catch (err) {
      console.warn("Error resending code:", err);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Register & Create Account
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(false);
    setError(null);

    if (!password || password.length < 6) {
      setPasswordError(true);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
      return;
    }

    setLoading(true);
    try {
      const emailLower = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, emailLower, password);
      const user = userCredential.user;

      // Update Auth profile displayName
      try {
        await updateProfile(user, { displayName: username.trim() });
      } catch (profileErr) {
        console.warn("Failed to update Firebase Auth displayName profile:", profileErr);
      }

      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          displayName: username.trim()
        });
      }

      // Save user profile to Firestore asynchronously in background so DB permissions don't block registration
      setDoc(doc(db, "users", user.uid), {
        email: emailLower,
        displayName: username.trim(),
        provider: "password",
        createdAt: new Date().toISOString()
      }, { merge: true }).catch((dbSaveErr) => {
        console.error("Failed to save user profile to database during registration:", dbSaveErr);
      });

      setSuccess(t.registerSuccess);
      setTimeout(() => {
        onClose();
        resetRegisterFlow();
        setIsRegister(false);
        if (onSuccessRegister) {
          onSuccessRegister();
        }
      }, 1500);
    } catch (err: any) {
      console.warn("Registration error handled gracefully:", err.code || err.message);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Save user to database (Firestore) with provider "google" asynchronously in background
      setDoc(doc(db, "users", user.uid), {
        email: user.email?.toLowerCase(),
        displayName: user.displayName,
        provider: "google",
        lastLoginAt: new Date().toISOString()
      }, { merge: true }).catch((dbSaveErr) => {
        console.error("Failed to save Google user in database:", dbSaveErr);
      });

      setSuccess(t.loginSuccess);
      setTimeout(() => {
        onClose();
        resetRegisterFlow();
      }, 1000);
    } catch (err: any) {
      console.warn("Google authentication issue handled gracefully:", err.code || err.message);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose();
              resetRegisterFlow();
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-md overflow-y-auto max-h-[calc(100vh-2rem)] rounded-2xl bg-white p-5 xs:p-7 shadow-2xl border border-slate-100 z-10 scrollbar-thin scrollbar-thumb-slate-200"
            style={{ direction: isAr ? "rtl" : "ltr" }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                onClose();
                resetRegisterFlow();
              }}
              className={`absolute top-4 ${isAr ? "left-4" : "right-4"} p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all duration-200 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center`}
              aria-label={t.close}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Content */}
            <div className="text-center mt-3 mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-sm border border-indigo-100/50">
                {isRegister ? (
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 font-sans tracking-tight">
                {isRegister ? (
                  isAr ? (
                    registerStep === 1 ? "إنشاء حساب - خطوة 1 من 3" :
                    registerStep === 2 ? "تأكيد بريدك الإلكتروني" : "تعيين كلمة المرور"
                  ) : (
                    registerStep === 1 ? "Sign Up - Step 1 of 3" :
                    registerStep === 2 ? "Verify your Email" : "Set Password"
                  )
                ) : (
                  t.loginTitle
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed px-4">
                {isRegister ? (
                  isAr ? (
                    registerStep === 1 ? "الرجاء إدخال اسم المستخدم والبريد الإلكتروني للبدء" :
                    registerStep === 2 ? `أدخل رمز التحقق المكون من 6 أرقام المرسل لبريدك الإلكتروني` : "قم بتعيين كلمة مرور آمنة لحسابك"
                  ) : (
                    registerStep === 1 ? "Please enter your username and email to start" :
                    registerStep === 2 ? "Enter the 6-digit verification code sent to your email" : "Set a secure password for your account"
                  )
                ) : (
                  isAr ? "سجل دخولك لحفظ بياناتك ومتابعة شحناتك" : "Sign in to track your purchase history"
                )}
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-bold text-rose-800 text-center leading-relaxed shadow-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs font-bold text-emerald-800 text-center flex items-center justify-center gap-2 shadow-sm">
                <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {/* Forms Wrapper */}
            {!isRegister ? (
              /* --- LOGIN FORM --- */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                    {t.email}
                  </label>
                  <div className="relative group">
                    <span className={`absolute inset-y-0 ${isAr ? "right-3.5" : "left-3.5"} flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200`}>
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(false);
                      }}
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4" : "pl-11 pr-4"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                        emailError 
                          ? "bg-rose-50 border border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100" 
                          : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                      }`}
                      placeholder="example@domain.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                    {t.password}
                  </label>
                  <div className="relative group">
                    <span className={`absolute inset-y-0 ${isAr ? "right-3.5" : "left-3.5"} flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200`}>
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(false);
                      }}
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-11" : "pl-11 pr-11"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                        passwordError 
                          ? "bg-rose-50 border border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100" 
                          : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className={`absolute inset-y-0 ${isAr ? "left-3.5" : "right-3.5"} flex items-center text-slate-400 hover:text-indigo-600 transition-colors duration-200 min-h-[44px] px-1`}
                      tabIndex={-1}
                      title={showLoginPassword ? (isAr ? "إخفاء كلمة المرور" : "Hide Password") : (isAr ? "إظهار كلمة المرور" : "Show Password")}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 active:scale-[0.99] disabled:bg-slate-100 text-white disabled:text-slate-300 py-3.5 text-xs font-bold transition-all duration-200 shadow-sm min-h-[44px] cursor-pointer mt-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.login}
                </button>
              </form>
            ) : (
              /* --- REGISTER FLOW STEPS --- */
              <div>
                {registerStep === 1 && (
                  /* Step 1: Username & Email Only */
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                        {isAr ? "اسم المستخدم" : "Username"}
                      </label>
                      <div className="relative group">
                        <span className={`absolute inset-y-0 ${isAr ? "right-3.5" : "left-3.5"} flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200`}>
                          <User className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError(false);
                          }}
                          className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4" : "pl-11 pr-4"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                            usernameError
                              ? "bg-rose-50 border border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                              : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                          }`}
                          placeholder={isAr ? "مثال: أحمد محمد" : "e.g. John Doe"}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                        {isAr ? "البريد الإلكتروني" : "Email Address"}
                      </label>
                      <div className="relative group">
                        <span className={`absolute inset-y-0 ${isAr ? "right-3.5" : "left-3.5"} flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200`}>
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(false);
                          }}
                          className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4" : "pl-11 pr-4"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                            emailError
                              ? "bg-rose-50 border border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                              : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                          }`}
                          placeholder="example@domain.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 active:scale-[0.99] disabled:bg-slate-100 text-white disabled:text-slate-300 py-3.5 text-xs font-bold transition-all duration-200 shadow-sm min-h-[44px] cursor-pointer mt-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        isAr ? "إرسال رمز التحقق" : "Send Verification Code"
                      )}
                    </button>
                  </form>
                )}

                {registerStep === 2 && (
                  /* Step 2: Verification Code (in a different screen layout as requested) */
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider text-center">
                        {isAr ? "أدخل رمز التحقق المرسل" : "Enter Verification Code"}
                      </label>
                      <div className="relative group">
                        <span className={`absolute inset-y-0 ${isAr ? "right-3.5" : "left-3.5"} flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200`}>
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={verificationCodeInput}
                          onChange={(e) => setVerificationCodeInput(e.target.value)}
                          className="w-full rounded-xl py-3.5 text-center tracking-widest font-mono text-sm font-black focus:outline-none transition-all duration-200 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                          placeholder="123456"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading || !verificationCodeInput}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 active:scale-[0.99] disabled:bg-slate-100 text-white disabled:text-slate-300 py-3.5 text-xs font-bold transition-all duration-200 shadow-sm min-h-[44px] cursor-pointer"
                      >
                        {isAr ? "تأكيد والتحقق من الرمز" : "Verify Code"}
                      </button>

                      {/* Resend button with 60 second countdown */}
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={timer > 0}
                        className={`text-xs font-bold mt-2 transition-all duration-200 ${
                          timer > 0 
                            ? "text-slate-400 cursor-not-allowed" 
                            : "text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                        }`}
                      >
                        {timer > 0 
                          ? (isAr ? `إعادة إرسال الرمز خلال (${timer} ثانية)` : `Resend code in (${timer}s)`)
                          : (isAr ? "إعادة إرسال الرمز" : "Resend Verification Code")
                        }
                      </button>
                    </div>
                  </form>
                )}

                {registerStep === 3 && (
                  /* Step 3: Password input only */
                  <form onSubmit={handleFinalRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                        {isAr ? "تعيين كلمة المرور" : "Set Password"}
                      </label>
                      <div className="relative group">
                        <span className={`absolute inset-y-0 ${isAr ? "right-3.5" : "left-3.5"} flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200`}>
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                          }}
                          className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-11" : "pl-11 pr-11"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                            passwordError 
                              ? "bg-rose-50 border border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100" 
                              : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className={`absolute inset-y-0 ${isAr ? "left-3.5" : "right-3.5"} flex items-center text-slate-400 hover:text-indigo-600 transition-colors duration-200 min-h-[44px] px-1`}
                          tabIndex={-1}
                          title={showRegisterPassword ? (isAr ? "إخفاء كلمة المرور" : "Hide Password") : (isAr ? "إظهار كلمة المرور" : "Show Password")}
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 active:scale-[0.99] disabled:bg-slate-100 text-white disabled:text-slate-300 py-3.5 text-xs font-bold transition-all duration-200 shadow-sm min-h-[44px] cursor-pointer mt-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        isAr ? "إكمال إنشاء الحساب والولوج" : "Complete Registration & Log In"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Separator & Google Auth */}
            {!isRegister && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3.5 text-slate-400 font-bold tracking-wider">{t.or}</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleAuth}
                  type="button"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-700 hover:text-slate-900 py-3.5 text-xs font-bold transition-all duration-200 shadow-sm min-h-[44px] cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>{t.googleLogin}</span>
                </button>
              </>
            )}

            {/* Toggle Login / Register */}
            <div className="text-center mt-6 text-[11px] font-bold text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  resetRegisterFlow();
                }}
                className="hover:text-indigo-600 hover:underline transition-all duration-200 min-h-[36px] px-3 inline-flex items-center justify-center cursor-pointer"
              >
                {isRegister ? t.haveAccount : t.noAccount}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

