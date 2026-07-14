import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Loader2, Sparkles, User, ShieldCheck, Eye, EyeOff, ArrowLeft, Send, CheckCircle2, X, ExternalLink, AlertCircle, Settings } from "lucide-react";
import { Language, TRANSLATIONS } from "../types";
import Logo from "./Logo";
import { 
  auth, 
  googleProvider, 
  githubProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  db
} from "../firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

interface SignInPageProps {
  language: Language;
  onBack: () => void;
  onUserUpdate?: (user: any) => void;
}

// Colored SVG Icons for the Social Login row exactly matching the screenshot
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const PlayGamesIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark Green Triangle Background with Rounded Corners */}
    <path
      d="M3.5 2.1c-1.1-.6-2.5.2-2.5 1.5v16.8c0 1.3 1.4 2.1 2.5 1.5l14.7-8.4c1-.6 1-2.1 0-2.7L3.5 2.1z"
      fill="#006B4E"
    />
    
    {/* Bright Green Game Controller (Rotated and scaled to fit the triangle) */}
    <g transform="translate(9.5, 12.2) rotate(-12) scale(0.65) translate(-12, -12)">
      {/* Game Controller Body */}
      <path
        d="M7.5 6H16.5C18.5 6 22 7.5 22 12C22 15 20.5 18 18 18C15.5 18 14.5 14.5 12 14.5C9.5 14.5 8.5 18 6 18C3.5 18 2 15 2 12C2 7.5 5.5 6 7.5 6Z"
        fill="#00E676"
      />
      {/* D-Pad on the left */}
      <path
        d="M7.5 9.5H6.5V11H5V12.5H6.5V14H7.5V12.5H9V11H7.5V9.5Z"
        fill="white"
      />
      {/* Action Buttons on the right (Diamond layout) */}
      <circle cx="16.5" cy="9.5" r="0.8" fill="white" />
      <circle cx="18" cy="11.2" r="0.8" fill="white" />
      <circle cx="16.5" cy="12.9" r="0.8" fill="white" />
      <circle cx="15" cy="11.2" r="0.8" fill="white" />
    </g>
  </svg>
);

const GithubIcon = () => (
  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function SignInPage({ language, onBack, onUserUpdate }: SignInPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Verification, 3: Password
  
  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  
  // Show/hide passwords
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Errors & Loading state
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [configErrorModal, setConfigErrorModal] = useState<{ isOpen: boolean; provider: "playgames" | "github" | null }>({ isOpen: false, provider: null });

  const t = TRANSLATIONS[language];
  const isAr = language === "ar";

  // Countdown timer for code verification cooldown
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Reset page flow
  const resetFlow = () => {
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
    setVerificationError(false);
    setError(null);
    setSuccess(null);
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
  };

  // Forgot Password Flow States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Code, 3: Password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordCodeInput, setForgotPasswordCodeInput] = useState("");
  const [forgotPasswordGeneratedCode, setForgotPasswordGeneratedCode] = useState("");
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState("");
  const [forgotPasswordConfirmPassword, setForgotPasswordConfirmPassword] = useState("");
  const [showForgotPasswordNewPassword, setShowForgotPasswordNewPassword] = useState(false);
  const [showForgotPasswordConfirmPassword, setShowForgotPasswordConfirmPassword] = useState(false);

  const resetForgotPasswordFlow = () => {
    setIsForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotPasswordEmail("");
    setForgotPasswordCodeInput("");
    setForgotPasswordGeneratedCode("");
    setForgotPasswordNewPassword("");
    setForgotPasswordConfirmPassword("");
    setTimer(0);
    setError(null);
    setSuccess(null);
    setEmailError(false);
    setPasswordError(false);
    setVerificationError(false);
  };

  const handleForgotPasswordRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setEmailError(false);

    const emailLower = email.trim().toLowerCase();
    if (!emailLower) {
      setEmailError(true);
      setError(isAr ? "الرجاء إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists in Firestore
      const q = query(collection(db, "users"), where("email", "==", emailLower));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setEmailError(true);
        setError(isAr ? "البريد الإلكتروني المدخل غير مسجل لدينا" : "The email address is not registered");
        setLoading(false);
        return;
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
          username: querySnapshot.docs[0].data().displayName || "",
          type: "reset",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send code");
      }

      setForgotPasswordGeneratedCode(code);
      setForgotPasswordEmail(emailLower);
      setTimer(60);
      setForgotPasswordStep(2);
      setForgotPasswordCodeInput("");
      setSuccess(isAr ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني" : "Verification code sent to your email");
    } catch (err: any) {
      console.warn("Error sending forgot password email:", err);
      setEmailError(true);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordResendCode = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const response = await fetch("/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          code,
          type: "reset",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send code");
      }

      setForgotPasswordGeneratedCode(code);
      setTimer(60);
      setForgotPasswordCodeInput("");
      setSuccess(isAr ? "تم إعادة إرسال الرمز بنجاح" : "Verification code resent successfully");
    } catch (err) {
      console.warn("Error resending forgot password code:", err);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setVerificationError(false);

    if (forgotPasswordCodeInput.trim() === forgotPasswordGeneratedCode) {
      setForgotPasswordStep(3);
    } else {
      setVerificationError(true);
      setError(isAr ? "رمز التحقق الذي أدخلته غير صحيح" : "The verification code you entered is incorrect");
    }
  };

  const handleForgotPasswordResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPasswordError(false);

    if (!forgotPasswordNewPassword || forgotPasswordNewPassword.length < 6) {
      setPasswordError(true);
      setError(isAr ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    if (forgotPasswordNewPassword !== forgotPasswordConfirmPassword) {
      setPasswordError(true);
      setError(isAr ? "كلمات السر غير متشابه" : "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          newPassword: forgotPasswordNewPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reset password");
      }

      setSuccess(isAr ? "تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول." : "Password reset successfully! You can now sign in.");
      
      // Delay before returning to login form
      setTimeout(() => {
        resetForgotPasswordFlow();
      }, 2000);
    } catch (err: any) {
      console.warn("Password reset error:", err);
      setError(isAr ? "لقد حدث خطأ ما أثناء إعادة تعيين كلمة المرور" : "Something went wrong while resetting the password");
    } finally {
      setLoading(false);
    }
  };

  // Google authentication
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
      if (onUserUpdate) {
        onUserUpdate(user);
      }
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err: any) {
      console.warn("Google authentication handled gracefully:", err.code || err.message);
      if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          isAr 
            ? "البريد الإلكتروني المرتبط بهذا الحساب مسجل بالفعل باستخدام طريقة أخرى (مثل البريد الإلكتروني أو طريقة أخرى). يرجى تسجيل الدخول بالطريقة الأصلية." 
            : "An account already exists with the same email address but different sign-in credentials. Please use your original sign-in method."
        );
      } else {
        setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // Play Games authentication
  const handlePlayGamesAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Save user to database (Firestore) with provider "playgames" asynchronously in background
      setDoc(doc(db, "users", user.uid), {
        email: user.email?.toLowerCase() || null,
        displayName: user.displayName || (isAr ? "لاعب بلاي جيمز" : "Play Games Player"),
        provider: "playgames",
        lastLoginAt: new Date().toISOString()
      }, { merge: true }).catch((dbSaveErr) => {
        console.error("Failed to save Play Games user in database:", dbSaveErr);
      });

      setSuccess(t.loginSuccess);
      if (onUserUpdate) {
        onUserUpdate(user);
      }
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err: any) {
      console.warn("Play Games authentication handled gracefully:", err.code || err.message);
      if (err.code === "auth/invalid-credential-or-provider-id" || err.code === "auth/configuration-not-found") {
        setConfigErrorModal({ isOpen: true, provider: "playgames" });
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          isAr 
            ? "البريد الإلكتروني المرتبط بهذا الحساب مسجل بالفعل باستخدام طريقة أخرى (مثل البريد الإلكتروني أو طريقة أخرى). يرجى تسجيل الدخول بالطريقة الأصلية." 
            : "An account already exists with the same email address but different sign-in credentials. Please use your original sign-in method."
        );
      } else {
        setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // GitHub authentication
  const handleGithubAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const user = userCredential.user;

      // Save user to database (Firestore) with provider "github" asynchronously in background
      setDoc(doc(db, "users", user.uid), {
        email: user.email?.toLowerCase() || null,
        displayName: user.displayName || "GitHub Player",
        provider: "github",
        lastLoginAt: new Date().toISOString()
      }, { merge: true }).catch((dbSaveErr) => {
        console.error("Failed to save GitHub user in database:", dbSaveErr);
      });

      setSuccess(t.loginSuccess);
      if (onUserUpdate) {
        onUserUpdate(user);
      }
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err: any) {
      console.warn("GitHub authentication handled gracefully:", err.code || err.message);
      if (err.code === "auth/invalid-credential-or-provider-id" || err.code === "auth/configuration-not-found") {
        setConfigErrorModal({ isOpen: true, provider: "github" });
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          isAr 
            ? "البريد الإلكتروني المرتبط بحساب GitHub مسجل بالفعل باستخدام طريقة تسجيل دخول أخرى (مثل جوجل أو البريد الإلكتروني). يرجى تسجيل الدخول بالطريقة الأصلية." 
            : "An account already exists with the same email address but different sign-in credentials (e.g. Google or Email). Please use your original sign-in method."
        );
      } else {
        setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    setError(null);
    setSuccess(null);
    
    if (!email) {
      setEmailError(true);
      return;
    }
    if (!password) {
      setPasswordError(true);
      return;
    }

    setLoading(true);
    try {
      const emailLower = email.trim().toLowerCase();

      // Check password history first to display custom "expired" error if needed
      try {
        const historyCheck = await fetch("/api/check-password-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailLower, password })
        });
        if (historyCheck.ok) {
          const historyData = await historyCheck.json();
          if (historyData.isOld) {
            setError(isAr ? "كلمة السر لم تعد فعالة بعد الآن" : "Password is no longer active");
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log("[Auth Info] Skipping history check or using local history verification.");
      }

      let user: any = null;
      let usedFallback = false;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
        user = userCredential.user;
      } catch (authErr: any) {
        console.log("[Auth Info] Attempting secure local database verification...");
        
        // Try verifying credentials with our backend local fallback
        const fallbackRes = await fetch("/api/login-fallback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailLower, password })
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          user = fallbackData.user;
          usedFallback = true;
          // Store fallback user session
          localStorage.setItem("fallback_user", JSON.stringify(user));
        } else {
          // Both failed, throw original Firebase error
          throw authErr;
        }
      }

      if (!usedFallback) {
        // Save/sync current password on backend in the background
        fetch("/api/save-current-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailLower, password, displayName: user.displayName || email.split("@")[0] })
        }).catch((syncErr) => console.warn("Failed to sync current password:", syncErr));

        // Update last login in Firestore asynchronously
        setDoc(doc(db, "users", user.uid), {
          email: emailLower,
          displayName: user.displayName || email.split("@")[0],
          provider: "password",
          lastLoginAt: new Date().toISOString()
        }, { merge: true }).catch((dbSaveErr) => {
          console.error("Failed to update last login in database:", dbSaveErr);
        });
      }

      setSuccess(t.loginSuccess);
      if (onUserUpdate) {
        onUserUpdate(user);
      }
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err: any) {
      setEmailError(true);
      setPasswordError(true);
      setError(isAr ? "كلمة المرور التي أدخلتها خاطئة" : "The password you entered is incorrect");
    } finally {
      setLoading(false);
    }
  };

  // Register: Step 1 (Validation & Code dispatch)
  const handleSendCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setUsernameError(false);
    setError(null);
    setSuccess(null);

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
      setSuccess(isAr ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني" : "Verification code sent to your email");
    } catch (err: any) {
      console.warn("Error sending verification code email:", err);
      setEmailError(true);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Register: Step 2 (Verification code verification check)
  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setVerificationError(false);

    if (verificationCodeInput.trim() === generatedCode) {
      setRegisterStep(3);
    } else {
      setVerificationError(true);
      setError(isAr ? "رمز التحقق الذي أدخلته غير صحيح" : "The verification code you entered is incorrect");
    }
  };

  // Register: Step 2 (Resend validation code)
  const handleResendCode = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
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
      setSuccess(isAr ? "تم إعادة إرسال الرمز بنجاح" : "Verification code resent successfully");
    } catch (err) {
      console.warn("Error resending code:", err);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Register: Step 3 (Set password & complete sign up)
  const handleFinalRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(false);
    setError(null);
    setSuccess(null);

    if (!password || password.length < 6) {
      setPasswordError(true);
      setError(isAr ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters");
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

      // Save user profile to Firestore asynchronously
      setDoc(doc(db, "users", user.uid), {
        email: emailLower,
        displayName: username.trim(),
        provider: "password",
        createdAt: new Date().toISOString()
      }, { merge: true }).catch((dbSaveErr) => {
        console.error("Failed to save user profile to database during registration:", dbSaveErr);
      });

      // Save/sync current password on backend in the background
      fetch("/api/save-current-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLower, password, displayName: username.trim() })
      }).catch((syncErr) => console.warn("Failed to sync current password on registration:", syncErr));

      setSuccess(t.registerSuccess);
      setTimeout(() => {
        onBack();
        resetFlow();
      }, 1500);
    } catch (err: any) {
      console.warn("Registration error handled gracefully:", err.code || err.message);
      setError(isAr ? "لقد حدث خطأ ما" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center px-4 py-12" dir={isAr ? "rtl" : "ltr"}>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[460px] bg-[#0d1527] border border-[#212d45] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40 relative overflow-hidden"
      >
        {/* Navigation back */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
          <span>{isAr ? "الرجوع للرئيسية" : "Back to Home"}</span>
        </button>

        {/* Logo / Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="inline-block relative mb-2">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#00f2fe] to-[#0072ff] rounded-full opacity-25 blur-lg animate-pulse" />
            <Logo className="h-14 w-auto mx-auto relative drop-shadow-[0_0_15px_rgba(0,242,254,0.35)]" hideText={true} />
          </div>
          <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00f2fe] tracking-tight uppercase font-sans">
            Shop2Power
          </span>
        </div>

        {/* Global Error & Success notifications */}
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 rounded-2xl bg-rose-950/20 border border-rose-800/30 p-4 text-xs font-bold text-rose-400 flex items-start gap-2.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 p-4 text-xs font-bold text-emerald-400 flex items-start gap-2.5"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------- VIEW 1: SIGN IN PAGE ----------------- */}
        {!isRegister ? (
          isForgotPassword ? (
            <div>
              {/* Header Titles */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                  {isAr ? "استعادة كلمة المرور" : "Recover Password"}
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {forgotPasswordStep === 1 && (isAr ? "الخطوة 1 من 3: البريد الإلكتروني" : "Step 1 of 3: Email Address")}
                  {forgotPasswordStep === 2 && (isAr ? "الخطوة 2 من 3: رمز التحقق" : "Step 2 of 3: Verification Code")}
                  {forgotPasswordStep === 3 && (isAr ? "الخطوة 3 من 3: كلمة المرور الجديدة" : "Step 3 of 3: New Password")}
                </p>
              </div>

              {/* Stepper Progress Bar */}
              <div className="flex items-center justify-between gap-2 max-w-xs mx-auto mb-8">
                <div className={`h-1.5 flex-1 rounded-full ${forgotPasswordStep >= 1 ? "bg-[#00f2fe]" : "bg-[#161f30]"}`} />
                <div className={`h-1.5 flex-1 rounded-full ${forgotPasswordStep >= 2 ? "bg-[#00f2fe]" : "bg-[#161f30]"}`} />
                <div className={`h-1.5 flex-1 rounded-full ${forgotPasswordStep >= 3 ? "bg-[#00f2fe]" : "bg-[#161f30]"}`} />
              </div>

              {/* STEP 1: Email Address input */}
              {forgotPasswordStep === 1 && (
                <form onSubmit={handleForgotPasswordRequestEmail} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="relative flex items-center">
                      <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
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
                        className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                          emailError 
                            ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" 
                            : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                        }`}
                        placeholder={isAr ? "البريد الإلكتروني" : "Email Address"}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1877F2] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-md shadow-[#1877F2]/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isAr ? "جاري الإرسال..." : "Sending..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{isAr ? "إرسال رمز التحقق" : "Send Verification Code"}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Code Verification */}
              {forgotPasswordStep === 2 && (
                <form onSubmit={handleForgotPasswordVerifyCode} className="space-y-4">
                  <p className="text-center text-xs text-slate-400 mb-2 leading-relaxed">
                    {isAr 
                      ? `تم إرسال رمز تحقق مكون من 6 أرقام إلى: ${forgotPasswordEmail}`
                      : `A 6-digit verification code has been sent to: ${forgotPasswordEmail}`}
                  </p>
                  
                  <div className="space-y-1.5">
                    <div className="relative flex items-center">
                      <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotPasswordCodeInput}
                        onChange={(e) => {
                          setForgotPasswordCodeInput(e.target.value.replace(/\D/g, ""));
                          setVerificationError(false);
                        }}
                        className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"} text-xs font-mono tracking-[4px] font-bold focus:outline-none transition-all duration-200 ${
                          verificationError 
                            ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" 
                            : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                        }`}
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  {/* Resend and countdown timer matching the 60 seconds requirement exactly */}
                  <div className="flex justify-between items-center text-xs mt-2 px-1">
                    <button
                      type="button"
                      disabled={timer > 0 || loading}
                      onClick={handleForgotPasswordResendCode}
                      className={`font-bold transition-colors ${
                        timer > 0 
                          ? "text-slate-500 cursor-not-allowed" 
                          : "text-[#00f2fe] hover:text-[#00c6ff] cursor-pointer"
                      }`}
                    >
                      {isAr ? "إعادة إرسال الرمز" : "Resend Code"}
                    </button>
                    {timer > 0 && (
                      <span className="text-slate-400 font-medium font-mono">
                        {isAr ? `إعادة الإرسال خلال ${timer} ثانية` : `Resend in ${timer}s`}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1877F2] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-md shadow-[#1877F2]/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isAr ? "التحقق من الرمز" : "Verify Code"}</span>
                  </button>
                </form>
              )}

              {/* STEP 3: Enter new password and confirm */}
              {forgotPasswordStep === 3 && (
                <form onSubmit={handleForgotPasswordResetPassword} className="space-y-4">
                  {/* Password 1 */}
                  <div className="space-y-1.5">
                    <div className="relative flex items-center">
                      <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showForgotPasswordNewPassword ? "text" : "password"}
                        required
                        value={forgotPasswordNewPassword}
                        onChange={(e) => {
                          setForgotPasswordNewPassword(e.target.value);
                          setPasswordError(false);
                        }}
                        className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-11 text-right" : "pl-11 pr-11 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                          passwordError 
                            ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" 
                            : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                        }`}
                        placeholder={isAr ? "كلمة المرور الجديدة" : "New Password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordNewPassword(!showForgotPasswordNewPassword)}
                        className={`absolute inset-y-0 ${isAr ? "left-3.5" : "right-3.5"} flex items-center text-slate-400 hover:text-[#00f2fe] transition-colors duration-200 min-h-[44px] px-1`}
                        tabIndex={-1}
                      >
                        {showForgotPasswordNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password 2 */}
                  <div className="space-y-1.5">
                    <div className="relative flex items-center">
                      <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showForgotPasswordConfirmPassword ? "text" : "password"}
                        required
                        value={forgotPasswordConfirmPassword}
                        onChange={(e) => {
                          setForgotPasswordConfirmPassword(e.target.value);
                          setPasswordError(false);
                        }}
                        className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-11 text-right" : "pl-11 pr-11 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                          passwordError 
                            ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" 
                            : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                        }`}
                        placeholder={isAr ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordConfirmPassword(!showForgotPasswordConfirmPassword)}
                        className={`absolute inset-y-0 ${isAr ? "left-3.5" : "right-3.5"} flex items-center text-slate-400 hover:text-[#00f2fe] transition-colors duration-200 min-h-[44px] px-1`}
                        tabIndex={-1}
                      >
                        {showForgotPasswordConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1877F2] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-md shadow-[#1877F2]/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                      </>
                    ) : (
                      <span>{isAr ? "حفظ كلمة المرور الجديدة" : "Save New Password"}</span>
                    )}
                  </button>
                </form>
              )}

              {/* Back to Login Footer */}
              <div className="mt-8 text-center text-xs">
                <button
                  type="button"
                  onClick={resetForgotPasswordFlow}
                  className="text-[#00f2fe] font-black hover:underline focus:outline-none cursor-pointer"
                >
                  {isAr ? "الرجوع لتسجيل الدخول" : "Back to Sign In"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Header Titles */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                  {isAr ? "تسجيل الدخول إلى حسابك" : "Sign in to your account"}
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {isAr ? "أهلاً بعودتك! يُرجى إدخال بياناتك." : "Welcome back! Please enter your details."}
                </p>
              </div>

              {/* Social Authentication Row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleGithubAuth}
                  className="flex items-center justify-center py-3 border border-[#212d45] rounded-xl hover:bg-[#161f30] hover:border-[#00f2fe]/30 transition-all duration-200 min-h-[44px] cursor-pointer text-white"
                  title={isAr ? "تسجيل الدخول بواسطة GitHub" : "Sign in with GitHub"}
                >
                  <GithubIcon />
                </button>

                <button
                  type="button"
                  onClick={handlePlayGamesAuth}
                  className="flex items-center justify-center py-3 border border-[#212d45] rounded-xl hover:bg-[#161f30] hover:border-[#00f2fe]/30 transition-all duration-200 min-h-[44px] cursor-pointer text-white"
                  title={isAr ? "تسجيل الدخول بواسطة Play Games" : "Sign in with Play Games"}
                >
                  <PlayGamesIcon />
                </button>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="flex items-center justify-center py-3 border border-[#212d45] rounded-xl hover:bg-[#161f30] hover:border-[#00f2fe]/30 transition-all duration-200 min-h-[44px] cursor-pointer text-white"
                  title={isAr ? "تسجيل الدخول بواسطة Google" : "Sign in with Google"}
                >
                  <GoogleIcon />
                </button>
              </div>

              {/* Divider exactly matching the image */}
              <div className="relative flex py-3 items-center my-5">
                <div className="flex-grow border-t border-[#212d45]"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 font-bold">
                  {isAr ? "أو" : "Or"}
                </span>
                <div className="flex-grow border-t border-[#212d45]"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
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
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                        emailError 
                          ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" 
                          : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                      }`}
                      placeholder={isAr ? "البريد الإلكتروني" : "Email Address"}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
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
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-11 text-right" : "pl-11 pr-11 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                        passwordError 
                          ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" 
                          : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                      }`}
                      placeholder={isAr ? "كلمة السر" : "Password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className={`absolute inset-y-0 ${isAr ? "left-3.5" : "right-3.5"} flex items-center text-slate-400 hover:text-[#00f2fe] transition-colors duration-200 min-h-[44px] px-1`}
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Underlined forgot password link exactly as in the image */}
                <div className="text-right">
                  <span
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotPasswordStep(1);
                      setForgotPasswordEmail("");
                      setForgotPasswordCodeInput("");
                      setForgotPasswordNewPassword("");
                      setForgotPasswordConfirmPassword("");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs text-slate-400 font-semibold hover:text-[#00f2fe] transition-colors cursor-pointer underline decoration-solid decoration-[#212d45]"
                  >
                    {isAr ? "لقد نسيت كلمة المرور الخاصة بي" : "Forgot my password"}
                  </span>
                </div>

                {/* Login Button exactly matching the beautiful color and styling */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1877F2] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-md shadow-[#1877F2]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isAr ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
                  )}
                </button>
              </form>

              {/* Sign Up footer link matching the screenshot */}
              <div className="mt-8 text-center text-xs">
                <span className="text-slate-400 font-medium">{isAr ? "ليس لديك حساب؟ " : "Don't have an account? "}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    resetFlow();
                  }}
                  className="text-[#00f2fe] font-black hover:underline focus:outline-none cursor-pointer"
                >
                  {isAr ? "أنشئ حساب جديد" : "Create New Account"}
                </button>
              </div>
            </div>
          )
        ) : (
          /* ----------------- VIEW 2: REGISTER FLOW ----------------- */
          <div>
            {/* Header Titles */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                {isAr ? "أنشئ حساب جديد" : "Create New Account"}
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {registerStep === 1 && (isAr ? "الخطوة 1 من 3: البيانات الأساسية" : "Step 1 of 3: Primary Details")}
                {registerStep === 2 && (isAr ? "الخطوة 2 من 3: رمز التحقق" : "Step 2 of 3: Verification Code")}
                {registerStep === 3 && (isAr ? "الخطوة 3 من 3: كلمة المرور" : "Step 3 of 3: Secure Password")}
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-between gap-2 max-w-xs mx-auto mb-8">
              <div className={`h-1.5 flex-1 rounded-full ${registerStep >= 1 ? "bg-[#00f2fe]" : "bg-[#161f30]"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${registerStep >= 2 ? "bg-[#00f2fe]" : "bg-[#161f30]"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${registerStep >= 3 ? "bg-[#00f2fe]" : "bg-[#161f30]"}`} />
            </div>

            {/* STEP 1: Basic credentials */}
            {registerStep === 1 && (
              <form onSubmit={handleSendCodeSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
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
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                        usernameError 
                          ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800" 
                          : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                      }`}
                      placeholder={isAr ? "اسم المستخدم" : "Username"}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
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
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                        emailError 
                          ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800 focus:border-rose-500" 
                          : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                      }`}
                      placeholder={isAr ? "البريد الإلكتروني" : "Email Address"}
                    />
                  </div>
                </div>

                {/* Submit button step 1 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1877F2] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-md shadow-[#1877F2]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isAr ? "جاري التحقق من الحساب..." : "Verifying details..."}</span>
                    </>
                  ) : (
                    <span>{isAr ? "التالي (أرسل رمز التحقق)" : "Next (Send Code)"}</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Email code verification */}
            {registerStep === 2 && (
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                <div className="text-center bg-[#161f30] border border-[#212d45] rounded-2xl p-4 mb-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? "لقد أرسلنا رمز تحقق أمني مكون من 6 أرقام إلى:" : "We sent a 6-digit verification code to:"}
                    <strong className="block text-[#00f2fe] text-xs mt-1 select-all">{email}</strong>
                  </p>
                </div>

                {/* Code Input */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={verificationCodeInput}
                      onChange={(e) => {
                        setVerificationCodeInput(e.target.value.replace(/\D/g, ""));
                        setVerificationError(false);
                      }}
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-4 text-center tracking-[8px] font-bold" : "pl-11 pr-4 text-center tracking-[8px] font-bold"} text-base focus:outline-none transition-all duration-200 ${
                        verificationError 
                          ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 focus:border-rose-500" 
                          : "bg-[#161f30] border border-[#212d45] text-white focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                      }`}
                      placeholder="000000"
                    />
                  </div>
                </div>

                {/* Verification submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#1877F2] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-md shadow-[#1877F2]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isAr ? "تحقق ومتابعة" : "Verify & Continue"}</span>
                </button>

                {/* Resend Cooldown Code */}
                <div className="text-center mt-3">
                  <button
                    type="button"
                    disabled={timer > 0 || loading}
                    onClick={handleResendCode}
                    className={`text-xs font-bold transition duration-150 cursor-pointer ${
                      timer > 0 ? "text-slate-500 cursor-not-allowed" : "text-[#00f2fe] hover:underline"
                    }`}
                  >
                    {timer > 0 
                      ? (isAr ? `إعادة إرسال الرمز خلال (${timer} ثانية)` : `Resend code in (${timer}s)`) 
                      : (isAr ? "إعادة إرسال رمز التحقق" : "Resend Verification Code")
                    }
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Setup Password */}
            {registerStep === 3 && (
              <form onSubmit={handleFinalRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <span className={`absolute ${isAr ? "right-4" : "left-4"} text-slate-400`}>
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
                      className={`w-full rounded-xl py-3.5 ${isAr ? "pr-11 pl-11 text-right" : "pl-11 pr-11 text-left"} text-xs font-medium focus:outline-none transition-all duration-200 ${
                        passwordError 
                          ? "bg-rose-950/20 border border-rose-800/30 text-rose-300 placeholder-rose-800 focus:border-rose-500" 
                          : "bg-[#161f30] border border-[#212d45] text-white placeholder-slate-500 focus:bg-[#1a253a] focus:border-[#00f2fe] focus:ring-4 focus:ring-[#00f2fe]/15"
                      }`}
                      placeholder={isAr ? "أدخل كلمة سر قوية" : "Enter secure password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className={`absolute inset-y-0 ${isAr ? "left-3.5" : "right-3.5"} flex items-center text-slate-400 hover:text-[#00f2fe] transition-colors duration-200 min-h-[44px] px-1`}
                      tabIndex={-1}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Final Register completion submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1877F2] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-md shadow-[#1877F2]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isAr ? "جاري إنشاء حسابك..." : "Creating account..."}</span>
                    </>
                  ) : (
                    <span>{isAr ? "إكمال التسجيل والإنشاء" : "Complete Registration"}</span>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login Footer link */}
            <div className="mt-8 text-center text-xs">
              <span className="text-slate-400 font-medium">{isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}</span>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  resetFlow();
                }}
                className="text-[#00f2fe] font-black hover:underline focus:outline-none cursor-pointer"
              >
                {isAr ? "سجل دخول" : "Sign In"}
              </button>
            </div>
          </div>
        )}
      </motion.div>



      {/* Footer with copyright info */}
      <div className="text-center text-[10px] text-slate-500 font-medium pt-6 mt-6 border-t border-[#212d45] shrink-0">
        <span>{isAr ? "© ٢٠٢٦ Shop2Power. كل الحقوق محفوظة." : "© 2026 Shop2Power. All Rights Reserved."}</span>
      </div>

      {/* Configuration Error Helper Modal */}
      <AnimatePresence>
        {configErrorModal.isOpen && configErrorModal.provider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigErrorModal({ isOpen: false, provider: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 z-10"
            >
              {/* Top Banner accent color */}
              <div className={`h-2 w-full ${configErrorModal.provider === "playgames" ? "bg-[#0F9D58]" : "bg-slate-900"}`} />

              <button
                type="button"
                onClick={() => setConfigErrorModal({ isOpen: false, provider: null })}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors duration-200 min-h-[44px]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 sm:p-8" dir={isAr ? "rtl" : "ltr"}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${configErrorModal.provider === "playgames" ? "bg-green-50 text-[#0F9D58]" : "bg-slate-50 text-slate-900"}`}>
                    {configErrorModal.provider === "playgames" ? <PlayGamesIcon /> : <GithubIcon />}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {configErrorModal.provider === "playgames"
                        ? (isAr ? "خطوة أخيرة لتفعيل تسجيل الدخول بـ Play Games" : "Enable Play Games Sign-In")
                        : (isAr ? "خطوة أخيرة لتفعيل تسجيل الدخول بـ GitHub" : "Enable GitHub Auth")
                      }
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {isAr ? "إرشادات تهيئة لوحة تحكم Firebase" : "Firebase Console setup instructions"}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800">
                      {isAr ? "تنبيه التهيئة والربط" : "Configuration required"}
                    </h4>
                    <p className="text-xs text-amber-700 leading-relaxed mt-1 font-medium">
                      {isAr 
                        ? "الخدمة غير مفعّلة حالياً في Firebase. يرجى تفعيلها وربطها بالمفاتيح الصحيحة لتشغيل تسجيل الدخول بنجاح." 
                        : "This provider is not active in Firebase yet. Follow these quick steps to enable and connect your API keys."
                      }
                    </p>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isAr ? "خطوات الحل السريعة:" : "Setup Steps:"}
                  </h4>
                  
                  <div className="space-y-3">
                    {configErrorModal.provider === "playgames" ? (
                      <>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-extrabold text-[#0F9D58]">1</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "بما أن Play Games يعتمد على حساب Google، تأكد أولاً من تفعيل تسجيل الدخول عبر Google في لوحة تحكم Firebase."
                              : "Since Play Games auth runs via Google Accounts, verify that Google Sign-In is enabled in your Firebase Console."
                            }
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-extrabold text-[#0F9D58]">2</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "اذهب إلى قسم Authentication ثم تبويب Sign-in method وقم بتمكين Google (Enable)."
                              : "Go to Authentication > Sign-in method, choose Google and enable it."
                            }
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-extrabold text-[#0F9D58]">3</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "إذا كنت تقوم بتشغيل اللعبة على الهواتف، تأكد من إضافة بصمة تطبيق أندرويد (SHA-1) وإعداد خدمات Play Games من وحدة تحكم مطوري جوجل."
                              : "If launching on mobile, ensure your SHA-1 certificate is added to Firebase and Google Play Console is configured."
                            }
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-extrabold text-[#0F9D58]">4</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "يتم الآن حفظ بيانات اللاعب تحت مزود الخدمة 'playgames' تلقائياً وبأمان في قاعدة البيانات."
                              : "Players are now registered and identified with 'playgames' provider seamlessly inside Firestore."
                            }
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-extrabold text-slate-800">1</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "اذهب إلى لوحة تحكم Firebase وانتقل إلى قسم Authentication ثم تبويب Sign-in method."
                              : "Open Firebase Console, go to Authentication > Sign-in method."
                            }
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-extrabold text-slate-800">2</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "اضغط على إضافة مزود جديد (Add Provider) واختر GitHub ثم قم بتمكينه (Enable)."
                              : "Click Add new provider, choose GitHub and enable it."
                            }
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-extrabold text-slate-800">3</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "أدخل الـ Client ID والـ Client Secret اللذين تحصلت عليهما من إعدادات مطور جيت هاب."
                              : "Enter Client ID and Client Secret from your GitHub Developer Settings."
                            }
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-extrabold text-slate-800">4</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {isAr 
                              ? "انسخ رابط الـ Authorization Callback URL من فيربيز وضعه في إعدادات تطبيق جيت هاب."
                              : "Copy the Authorization Callback URL from Firebase and save it to your GitHub OAuth app."
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-indigo-100"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{isAr ? "افتح لوحة تحكم Firebase" : "Go to Firebase Console"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setConfigErrorModal({ isOpen: false, provider: null })}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 px-6 rounded-xl transition-all duration-200"
                  >
                    {isAr ? "حسناً، فهمت" : "Got it"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
