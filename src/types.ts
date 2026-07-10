export type Language = "ar" | "en";

export interface Game {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  image: string;
  banner: string;
  idFormat: string; // Helper hint for Player ID format
  idPlaceholder: string;
  idRegex: RegExp;
  currencyAr: string;
  currencyEn: string;
}

export interface Package {
  id: string;
  gameId: string;
  amount: number;
  bonus: number;
  price?: number; // in local currency base unit
  priceUSD: number;
  badgeAr?: string;
  badgeEn?: string;
}

export interface PaymentMethod {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
  feePercent: number;
}

export interface Transaction {
  id: string;
  invoiceId: string;
  gameId: string;
  gameNameAr: string;
  gameNameEn: string;
  gameImage: string;
  playerId: string;
  playerUsername: string;
  packageAmount: number;
  packageBonus: number;
  price: number;
  currencyAr: string;
  currencyEn: string;
  paymentMethodAr: string;
  paymentMethodEn: string;
  date: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
}

export interface Country {
  code: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  currencyAr: string;
  currencyEn: string;
  exchangeRate: number; // to base USD price
}

export const COUNTRIES: Country[] = [
  { code: "EG", nameAr: "مصر", nameEn: "Egypt", flag: "🇪🇬", currencyAr: "جنيه", currencyEn: "EGP", exchangeRate: 48 },
  { code: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia", flag: "🇸🇦", currencyAr: "ريال", currencyEn: "SAR", exchangeRate: 3.75 },
  { code: "AE", nameAr: "الإمارات", nameEn: "UAE", flag: "🇦🇪", currencyAr: "درهم", currencyEn: "AED", exchangeRate: 3.67 },
  { code: "MA", nameAr: "المغرب", nameEn: "Morocco", flag: "🇲🇦", currencyAr: "درهم", currencyEn: "MAD", exchangeRate: 10 },
  { code: "DZ", nameAr: "الجزائر", nameEn: "Algeria", flag: "🇩🇿", currencyAr: "دينار", currencyEn: "DZD", exchangeRate: 134 },
  { code: "IQ", nameAr: "العراق", nameEn: "Iraq", flag: "🇮🇶", currencyAr: "دينار", currencyEn: "IQD", exchangeRate: 1310 },
];

export const TRANSLATIONS = {
  ar: {
    appName: "شوب تو باور",
    appSubtitle: "المركز الرسمي المعتمد لشحن الألعاب",
    searchPlaceholder: "ابحث عن لعبة...",
    home: "الرئيسية",
    shop: "متجر الشحن",
    redeem: "مركز استبدال الأكواد",
    wallet: "شحن المحفظة (شيلز)",
    transactions: "معاملاتي",
    language: "Language",
    selectGame: "اختر اللعبة للبدء بالشحن",
    enterPlayerId: "1. أدخل معرف اللاعب (Player ID)",
    playerIdPlaceholder: "أدخل معرف اللاعب الخاص بك",
    verifyId: "تحقق من المعرف",
    verifying: "جاري التحقق...",
    verifiedAs: "اسم اللاعب المعتمد:",
    invalidId: "عفواً! معرف اللاعب غير صالح. يجب أن يحتوي على أرقام فقط (من 5 إلى 12 رقم).",
    selectPackage: "2. اختر كمية الشحن",
    selectPayment: "3. اختر طريقة الدفع",
    paymentInstructions: "يرجى اختيار وسيلة الدفع المناسبة لإتمام الشحن الفوري",
    checkoutSummary: "ملخص عملية الشحن",
    game: "اللعبة:",
    playerId: "معرف اللاعب:",
    playerName: "اسم اللاعب:",
    packageSelected: "الباقة المختارة:",
    subtotal: "المجموع:",
    fees: "رسوم الدفع:",
    total: "المبلغ الإجمالي:",
    payNow: "تأكيد الشحن والطلب",
    walletBalance: "رصيد المحفظة:",
    shells: "شيلز جارينا",
    checkoutTitle: "إكمال عملية الدفع",
    garenaVoucher: "كوبون جارينا شيلز",
    vodafoneCash: "فودافون كاش",
    fawry: "فوري",
    creditCard: "بطاقة ائتمان",
    sms: "رصيد الهاتف المحمول",
    back: "رجوع",
    bonus: "بونص",
    receiptTitle: "فاتورة شحن معتمدة",
    invoiceNo: "رقم الفاتورة:",
    date: "التاريخ والوقت:",
    status: "حالة العملية:",
    success: "ناجحة (تم الشحن)",
    pending: "معلقة",
    failed: "فشلت",
    printReceipt: "طباعة الفاتورة",
    close: "إغلاق",
    redeemTitle: "استبدال أكواد الهدايا والترويج",
    redeemSubtitle: "أدخل كود استرداد شوب تو باور أو جارينا للحصول على مكافآت فورية",
    redeemInputPlaceholder: "أدخل كود الاسترداد هنا (مثل: SHOP2POWER2026)",
    redeemBtn: "استرداد الآن",
    redeemSuccess: "تهانينا! تم تفعيل الكود بنجاح وإضافة المكافأة لرصيدك.",
    redeemError: "الكود المدخل غير صحيح أو انتهت صلاحيته.",
    walletTitle: "شحن رصيد Garena Shells",
    walletSubtitle: "اشحن محفظتك بـ Garena Shells لتحصل على خصم 10% دائم عند شحن أي لعبة في المتجر!",
    buyShells: "شراء شيلز جارينا",
    payWithWallet: "الدفع عن طريق محفظة جارينا شيلز (خصم 10%!)",
    insufficientWallet: "رصيد المحفظة غير كافٍ. يرجى شحن المحفظة أولاً أو اختيار وسيلة دفع أخرى.",
    topupWalletBtn: "اشحن الآن",
    noTransactions: "لا توجد معاملات سابقة بعد. ابدأ بشحن ألعابك المفضلة الآن!",
    supportTitle: "مساعد الدعم الفني الذكي",
    supportSubtitle: "اسألني عن طرق الشحن، العروض، أو تتبع شحنتك!",
    chatPlaceholder: "اكتب استفسارك هنا...",
    popularGames: "الألعاب الأكثر شحناً",
    verifiedGamer: "لاعب موثق",
    voucherInputPlaceholder: "أدخل كود بطاقة جارينا (16 رقماً)",
    phoneInputPlaceholder: "أدخل رقم الهاتف المحمول (مثال: 01012345678)",
    fawryInstructions: "توجه لأي منفذ فوري واستخدم كود الخدمة لدفع هذا الرقم المرجعي:",
    cardNoPlaceholder: "رقم البطاقة (16 خانة)",
    cardExpiryPlaceholder: "الشهر / السنة",
    cardCvvPlaceholder: "CVV",
    completePayment: "إكمال الدفع الآمن",
    simulatingPayment: "جاري محاكاة عملية الدفع الآمنة...",
    paymentSuccessMsg: "تم استلام الدفع بنجاح! جاري معالجة إرسال الجواهر/الاعتمادات إلى حسابك داخل اللعبة...",
    congrats: "تهانينا!",
    sentToInbox: "تم شحن الحساب بنجاح! ستصلك الجواهر مباشرة في بريد اللعبة خلال دقيقتين.",
    fawryPaidBtn: "لقد قمت بالدفع في منفذ فوري (محاكاة)",
    country: "البلد",
    allRightsReserved: "جميع الحقوق محفوظة لـ شوب تو باور © 2026",
    secureServer: "بوابة دفع مشفرة بالكامل ومعتمدة من Garena",
    howToFindId: "كيف أجد معرف اللاعب الخاص بي؟",
    freeFireIdHelp: "افتح لعبة Free Fire، اضغط على صورتك الشخصية في أعلى اليسار، وستجد الـ ID الخاص بك (مكون من 8-10 أرقام) أسفل اسمك مباشرة.",
    pubgIdHelp: "افتح لعبة PUBG Mobile، اضغط على صورتك في أعلى اليسار، ستجد الـ Character ID (مكون من 7-10 أرقام) بجانب اسمك.",
    robloxIdHelp: "افتح Roblox، انتقل لصفحة حسابك (Profile)، ستجد الـ ID في رابط المتصفح الخاص بصفحتك.",
    mlbbIdHelp: "افتح لعبة Mobile Legends، اضغط على صورتك الشخصية، ستجد الـ ID ورقم الخادم (Zone ID) أسفل اسمك مثل ID: 1234567 (1234).",
    helpTitle: "مركز المساعدة السريع",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    loginTitle: "تسجيل الدخول إلى حسابك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    or: "أو",
    googleLogin: "تسجيل الدخول بواسطة Google",
    noAccount: "ليس لديك حساب؟ سجل الآن",
    haveAccount: "لديك حساب بالفعل؟ سجل دخول",
    registerBtn: "إنشاء حساب جديد",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    logoutSuccess: "تم تسجيل الخروج بنجاح!",
    registerSuccess: "تم إنشاء الحساب بنجاح!",
    invalidEmailOrPassword: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من صحة البيانات المدخلة، أو الضغط على 'سجل الآن' في الأسفل لإنشاء حساب جديد.",
    googleLoginError: "فشل تسجيل الدخول بواسطة Google",
    fillAllFields: "يرجى ملء جميع الحقول",
  },
  en: {
    appName: "Shop2Power",
    appSubtitle: "Official Authorized Gaming Top-up Center",
    searchPlaceholder: "Search for a game...",
    home: "Home",
    shop: "Recharge Store",
    redeem: "Redeem Gift Codes",
    wallet: "Recharge Wallet (Shells)",
    transactions: "My Transactions",
    language: "اللغة",
    selectGame: "Select a Game to Start Recharging",
    enterPlayerId: "1. Enter Player ID",
    playerIdPlaceholder: "Enter your player ID",
    verifyId: "Verify Player ID",
    verifying: "Verifying...",
    verifiedAs: "Verified Player Name:",
    invalidId: "Sorry! Invalid Player ID. Must contain numbers only (5 to 12 digits).",
    selectPackage: "2. Select Package",
    selectPayment: "3. Select Payment Method",
    paymentInstructions: "Select your preferred payment method to complete instant top-up",
    checkoutSummary: "Top-up Order Summary",
    game: "Game:",
    playerId: "Player ID:",
    playerName: "Player Name:",
    packageSelected: "Selected Package:",
    subtotal: "Subtotal:",
    fees: "Payment Fee:",
    total: "Total Amount:",
    payNow: "Confirm & Recharge Now",
    walletBalance: "Wallet Balance:",
    shells: "Garena Shells",
    checkoutTitle: "Complete Secure Payment",
    garenaVoucher: "Garena Shells Voucher",
    vodafoneCash: "Vodafone Cash",
    fawry: "Fawry Pay",
    creditCard: "Credit Card",
    sms: "Mobile Mobile Credit",
    back: "Back",
    bonus: "Bonus",
    receiptTitle: "Authorized Top-up Invoice",
    invoiceNo: "Invoice ID:",
    date: "Date & Time:",
    status: "Transaction Status:",
    success: "Success (Delivered)",
    pending: "Pending",
    failed: "Failed",
    printReceipt: "Print Receipt",
    close: "Close",
    redeemTitle: "Redeem Gift & Promo Codes",
    redeemSubtitle: "Enter a Shop2Power or Garena promo code to unlock instant rewards & diamonds",
    redeemInputPlaceholder: "Enter promo code here (e.g. SHOP2POWER2026)",
    redeemBtn: "Redeem Now",
    redeemSuccess: "Congratulations! Code activated successfully, rewards added to balance.",
    redeemError: "Invalid or expired redemption code.",
    walletTitle: "Top-Up Garena Shells Balance",
    walletSubtitle: "Top-up Garena Shells wallet to enjoy a permanent 10% discount on all games in the store!",
    buyShells: "Purchase Garena Shells",
    payWithWallet: "Pay via Garena Shells Wallet (10% Off!)",
    insufficientWallet: "Insufficient wallet balance. Please top-up your Garena Shells or choose another payment method.",
    topupWalletBtn: "Top-Up Now",
    noTransactions: "No past transactions. Start topping up your favorite games now!",
    supportTitle: "AI Gaming Support Assistant",
    supportSubtitle: "Ask about top-up issues, current offers, or order tracking!",
    chatPlaceholder: "Type your query here...",
    popularGames: "Most Popular Games",
    verifiedGamer: "Verified Gamer",
    voucherInputPlaceholder: "Enter Garena PIN (16 digits)",
    phoneInputPlaceholder: "Enter mobile number (e.g. 01012345678)",
    fawryInstructions: "Go to any Fawry kiosk and use the service code to pay this reference number:",
    cardNoPlaceholder: "Card Number (16 digits)",
    cardExpiryPlaceholder: "MM / YY",
    cardCvvPlaceholder: "CVV",
    completePayment: "Complete Secure Payment",
    simulatingPayment: "Simulating secure payment gateway...",
    paymentSuccessMsg: "Payment received successfully! Dispatching in-game items to your profile...",
    congrats: "Congratulations!",
    sentToInbox: "Top-up successful! Game credits will arrive directly in your in-game mailbox within 2 minutes.",
    fawryPaidBtn: "I've paid at Fawry kiosk (Simulate)",
    country: "Country",
    allRightsReserved: "All rights reserved for Shop2Power © 2026",
    secureServer: "Fully encrypted secure checkout, authorized by Garena",
    howToFindId: "How to find my Player ID?",
    freeFireIdHelp: "Open Free Fire, click your avatar/name on top left, and you'll find your UID (8-10 digits) right under your username.",
    pubgIdHelp: "Open PUBG Mobile, click your avatar on top left, you'll find your Character ID (7-10 digits) next to your profile tag.",
    robloxIdHelp: "Open Roblox, navigate to your Profile page, and check the numbers in your browser URL bar.",
    mlbbIdHelp: "Open MLBB, click your avatar, you'll find your ID and Server ID (Zone ID) under your name like ID: 1234567 (1234).",
    helpTitle: "Quick Help Center",
    login: "Sign In",
    logout: "Log Out",
    loginTitle: "Log in to your account",
    email: "Email Address",
    password: "Password",
    or: "Or",
    googleLogin: "Sign in with Google",
    noAccount: "Don't have an account? Sign Up",
    haveAccount: "Already have an account? Log In",
    registerBtn: "Create New Account",
    loginSuccess: "Logged in successfully!",
    logoutSuccess: "Logged out successfully!",
    registerSuccess: "Account created successfully!",
    invalidEmailOrPassword: "The email or password is incorrect. Please verify your details, or click 'Sign Up' below to create a new account.",
    googleLoginError: "Google Sign-In failed",
    fillAllFields: "Please fill in all fields",
  }
};
