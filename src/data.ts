import { Game, Package, PaymentMethod } from "./types";

export const GAMES: Game[] = [
  {
    id: "freefire",
    nameAr: "فري فاير (جواهر)",
    nameEn: "Free Fire (Diamonds)",
    category: "Garena",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    idFormat: "8-10 digits",
    idPlaceholder: "e.g., 294810573",
    idRegex: /^\d{8,12}$/,
    currencyAr: "جواهر",
    currencyEn: "Diamonds"
  },
  {
    id: "pubg",
    nameAr: "ببجي موبايل (UC)",
    nameEn: "PUBG Mobile (UC)",
    category: "Tencent",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&auto=format&fit=crop&q=80",
    idFormat: "7-11 digits",
    idPlaceholder: "e.g., 5193847291",
    idRegex: /^\d{7,11}$/,
    currencyAr: "شدة",
    currencyEn: "UC"
  },
  {
    id: "mlbb",
    nameAr: "موبايل ليجندز (جواهر)",
    nameEn: "Mobile Legends (Diamonds)",
    category: "Moonton",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    idFormat: "User ID & Zone ID",
    idPlaceholder: "e.g., 12345678 (1234)",
    idRegex: /^\d{5,12}(\s?\(\d{3,5}\))?$/,
    currencyAr: "جواهر",
    currencyEn: "Diamonds"
  },
  {
    id: "roblox",
    nameAr: "روبلوكس (Robux)",
    nameEn: "Roblox (Robux)",
    category: "Roblox Corp",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&auto=format&fit=crop&q=80",
    idFormat: "Username or ID",
    idPlaceholder: "e.g., RobloxGamer123",
    idRegex: /^[a-zA-Z0-9_\-\.]{3,20}$/,
    currencyAr: "روبوكس",
    currencyEn: "Robux"
  },
  {
    id: "codm",
    nameAr: "كول أوف ديوتي (CP)",
    nameEn: "Call of Duty Mobile (CP)",
    category: "Activision",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    idFormat: "UID",
    idPlaceholder: "e.g., 684291048291047",
    idRegex: /^[a-zA-Z0-9\-\_]{10,25}$/,
    currencyAr: "نقطة CP",
    currencyEn: "CP Points"
  }
];

export const PACKAGES: Package[] = [
  // Free Fire
  { id: "ff_1", gameId: "freefire", amount: 100, bonus: 10, priceUSD: 1.00, badgeAr: "شائع", badgeEn: "Popular" },
  { id: "ff_2", gameId: "freefire", amount: 210, bonus: 21, priceUSD: 2.00, badgeAr: "توفير", badgeEn: "Saver" },
  { id: "ff_3", gameId: "freefire", amount: 530, bonus: 53, priceUSD: 5.00, badgeAr: "أفضل قيمة", badgeEn: "Best Value" },
  { id: "ff_4", gameId: "freefire", amount: 1080, bonus: 108, priceUSD: 10.00, badgeAr: "موصى به", badgeEn: "Recommended" },
  { id: "ff_5", gameId: "freefire", amount: 2200, bonus: 220, priceUSD: 20.00, badgeAr: "حزمة النخبة", badgeEn: "Elite Pack" },
  { id: "ff_6", gameId: "freefire", amount: 5600, bonus: 560, priceUSD: 50.00, badgeAr: "حزمة الأبطال", badgeEn: "Champion Pack" },

  // PUBG Mobile
  { id: "pubg_1", gameId: "pubg", amount: 60, bonus: 0, priceUSD: 0.99 },
  { id: "pubg_2", gameId: "pubg", amount: 325, bonus: 25, priceUSD: 4.99, badgeAr: "بونص إضافي", badgeEn: "Extra Bonus" },
  { id: "pubg_3", gameId: "pubg", amount: 660, bonus: 60, priceUSD: 9.99, badgeAr: "موصى به", badgeEn: "Recommended" },
  { id: "pubg_4", gameId: "pubg", amount: 1800, bonus: 220, priceUSD: 24.99, badgeAr: "حزمة رويال", badgeEn: "Royale Pack" },
  { id: "pubg_5", gameId: "pubg", amount: 3850, bonus: 550, priceUSD: 49.99, badgeAr: "حزمة الأساطير", badgeEn: "Legendary" },

  // Mobile Legends
  { id: "ml_1", gameId: "mlbb", amount: 50, bonus: 5, priceUSD: 0.99 },
  { id: "ml_2", gameId: "mlbb", amount: 250, bonus: 25, priceUSD: 4.99, badgeAr: "علاوة", badgeEn: "Promo" },
  { id: "ml_3", gameId: "mlbb", amount: 500, bonus: 65, priceUSD: 9.99, badgeAr: "الأكثر مبيعاً", badgeEn: "Best Seller" },
  { id: "ml_4", gameId: "mlbb", amount: 1000, bonus: 155, priceUSD: 19.99, badgeAr: "حزمة القوة", badgeEn: "Power Pack" },
  { id: "ml_5", gameId: "mlbb", amount: 2500, bonus: 450, priceUSD: 49.99, badgeAr: "حزمة الملوك", badgeEn: "King Pack" },

  // Roblox
  { id: "rb_1", gameId: "roblox", amount: 400, bonus: 0, priceUSD: 4.99 },
  { id: "rb_2", gameId: "roblox", amount: 800, bonus: 0, priceUSD: 9.99, badgeAr: "مستحسن", badgeEn: "Recommended" },
  { id: "rb_3", gameId: "roblox", amount: 1700, bonus: 0, priceUSD: 19.99 },
  { id: "rb_4", gameId: "roblox", amount: 4500, bonus: 500, priceUSD: 49.99, badgeAr: "ميجا باك", badgeEn: "Mega Pack" },

  // Call of Duty Mobile
  { id: "cod_1", gameId: "codm", amount: 80, bonus: 0, priceUSD: 0.99 },
  { id: "cod_2", gameId: "codm", amount: 400, bonus: 20, priceUSD: 4.99 },
  { id: "cod_3", gameId: "codm", amount: 800, bonus: 80, priceUSD: 9.99, badgeAr: "شائع", badgeEn: "Popular" },
  { id: "cod_4", gameId: "codm", amount: 2000, bonus: 400, priceUSD: 24.99, badgeAr: "قيمة ممتازة", badgeEn: "Super Value" },
  { id: "cod_5", gameId: "codm", amount: 4000, bonus: 1000, priceUSD: 49.99, badgeAr: "حزمة النخبة", badgeEn: "Elite Pack" }
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "garena_voucher",
    nameAr: "كوبون جارينا (Garena Voucher)",
    nameEn: "Garena Voucher",
    icon: "Ticket",
    descriptionAr: "ادفع باستخدام بطاقة جارينا مسبقة الدفع بـ 16 خانة للحصول على شحن فوري",
    descriptionEn: "Recharge instantly using a 16-digit Garena voucher card code",
    feePercent: 0
  },
  {
    id: "vodafone_cash",
    nameAr: "المحافظ الإلكترونية (فودافون، أورانج، اتصالات)",
    nameEn: "Mobile Wallets (Vodafone Cash, etc.)",
    icon: "Wallet",
    descriptionAr: "ادفع مباشرة عبر محفظتك الإلكترونية وسنرسل لك كود تفعيل فوري",
    descriptionEn: "Pay directly via mobile cash wallet with instant delivery",
    feePercent: 1.5
  },
  {
    id: "fawry",
    nameAr: "فوري (Fawry Pay)",
    nameEn: "Fawry Pay",
    icon: "DollarSign",
    descriptionAr: "احصل على كود مرجعي وادفع في أي منفذ فوري قريب منك خلال 48 ساعة",
    descriptionEn: "Get a reference code and pay at any Fawry retail shop within 48h",
    feePercent: 2.0
  },
  {
    id: "credit_card",
    nameAr: "بطاقة الائتمان (Visa / Mastercard)",
    nameEn: "Credit Card (Visa / Mastercard)",
    icon: "CreditCard",
    descriptionAr: "شحن مباشر وسريع عبر بوابة الدفع الآمنة والمشفرة",
    descriptionEn: "Fast & direct top-up via our secure, encrypted payment gateway",
    feePercent: 2.5
  },
  {
    id: "sms",
    nameAr: "شحن عبر رصيد الهاتف (SMS)",
    nameEn: "Mobile Carrier Billing (SMS)",
    icon: "Smartphone",
    descriptionAr: "خصم قيمة الشحن من رصيد هاتفك المحمول (لمشتركي فودافون، أورنج، اتصالات، WE)",
    descriptionEn: "Deduct the recharge amount directly from your phone credit",
    feePercent: 5.0
  }
];

// Helper to simulate gamer usernames based on player ID
export function getMockGamerName(playerId: string): string {
  const names = [
    "々LEGEND々", "M7MD_YT", "SHADOW_FF", "BOYKA_FF", "々K_I_N_G々",
    "DEATH_SHOT", "RAPTOR_GG", "NINJA_MENA", "LEGENDARY_HERO",
    "LION_HEART", "々W_A_R_R_I_O_R々", "NO_MERCY", "SNAKE_EYES"
  ];
  const num = parseInt(playerId.replace(/\D/g, "")) || 42;
  return names[num % names.length];
}
