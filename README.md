# دليل تشغيل تطبيق Shop2Power محلياً 🚀
# Shop2Power Local Running Guide

لقد قمنا بتوفير هذا الدليل لمساعدتك في تشغيل تطبيق **Shop2Power** على جهازك الشخصي بعد تحميل ملف الـ ZIP وفك الضغط عنه، وتجنب مشكلة "الشاشة البيضاء" التي تظهر عند محاولة فتح ملف `index.html` مباشرة.

---

## 🔍 لماذا تظهر شاشة بيضاء عند فتح ملف `index.html` مباشرة؟
تطبيقات الويب الحديثة (مثل React و Vite) تعتمد على وحدات JavaScript الذكية (ES Modules). المتصفحات الحديثة تمنع تشغيل هذه الملفات مباشرة من مجلدات الكمبيوتر (بروتوكول `file://`) لأسباب أمنية وتمنعها من تحميل المكونات (CORS).
لكي يعمل التطبيق بشكل صحيح، **يجب تشغيل خادم محلي (Local Server)**.

---

## 🛠️ خطوات تشغيل التطبيق على جهازك (خلال دقيقة واحدة):

### 1. تثبيت برنامج Node.js (إذا لم يكن لديك)
التطبيق يحتاج لبيئة تشغيل **Node.js**. إذا لم تكن مثبتة لديك:
* قم بتحميلها وتثبيتها من الموقع الرسمي: [https://nodejs.org](https://nodejs.org) (اختر نسخة LTS المستقرة).

### 2. فتح موجه الأوامر (Terminal / Command Prompt)
* افتح مجلد المشروع الذي قمت بفك الضغط عنه.
* افتح شاشة موجه الأوامر في هذا المجلد:
  * **على الويندوز (Windows):** اكتب `cmd` في شريط مسار المجلد أعلى الشاشة واضغط `Enter`.
  * **على الماك (Mac):** اضغط بزر الفأرة الأيمن على المجلد واختر `New Terminal at Folder`.

### 3. تثبيت حزم البرمجة (Dependencies)
اكتب الأمر التالي في موجه الأوامر واضغط `Enter` للبدء في تثبيت ملفات التشغيل:
```bash
npm install
```
*(انتظر ثوانٍ حتى ينتهي التثبيت).*

### 4. تشغيل التطبيق (خادم التطوير المباشر)
اكتب الأمر التالي واضغط `Enter`:
```bash
npm run dev
```

### 5. تصفح الموقع!
بمجرد كتابة الأمر، سيظهر لك مسار التشغيل كالتالي:
`http://localhost:3000`
* قم بنسخ هذا الرابط وفتحه في متصفحك (مثل Google Chrome)، وسيعمل الموقع معك بكامل ميزاته وبسرعة فائقة!

---

## 🛡️ إعداد المفاتيح السرية (اختياري)
إذا كنت ترغب في تشغيل المساعد الذكي (AI Assistant) محلياً، يمكنك إنشاء ملف باسم `.env` في المجلد الرئيسي وإضافة كود Gemini الخاص بك فيه:
```env
GEMINI_API_KEY=ضع_مفتاح_جيمني_هنا
```

---

## English Version (Quick Start)

### Why is the screen blank when double-clicking `index.html`?
Modern React/Vite applications require a running web server to handle ES Modules and bypass browser CORS security restrictions. Double-clicking the HTML file directly will not work.

### How to Run Locally:
1. Make sure you have **Node.js** installed (from [nodejs.org](https://nodejs.org)).
2. Open your terminal/command prompt inside the unzipped directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server (runs both frontend and backend):
   ```bash
   npm run dev
   ```
5. Open your browser and go to:
   ```text
   http://localhost:3000
   ```
