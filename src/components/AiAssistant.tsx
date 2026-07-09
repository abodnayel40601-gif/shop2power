import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, HelpCircle, AlertCircle } from "lucide-react";
import { Language, TRANSLATIONS } from "../types";

interface AiAssistantProps {
  language: Language;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function AiAssistant({ language }: AiAssistantProps) {
  const isAr = language === "ar";
  const t = TRANSLATIONS[language];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default suggested questions
  const SUGGESTED_QUESTIONS = isAr
    ? [
        { text: "كيف أجد معرف لاعب Free Fire؟", label: "معرف فري فاير" },
        { text: "ما هي العروض والخصومات المتوفرة اليوم؟", label: "العروض المتاحة" },
        { text: "شحنت الجواهر ولم تصلني حتى الآن، ماذا أفعل؟", label: "تأخر الشحنة" },
        { text: "كيف أقوم بشحن رصيد محفظتي (شيلز)؟", label: "شحن المحفظة" },
      ]
    : [
        { text: "How do I find my Free Fire player ID?", label: "Free Fire ID" },
        { text: "What coupon codes or discounts are available?", label: "Active Offers" },
        { text: "I completed top-up but didn't receive items?", label: "Delayed Recharge" },
        { text: "How do I top up my Garena Shells wallet?", label: "Wallet Topup" },
      ];

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: isAr
            ? "أهلاً بك في مركز الدعم الفني الذكي لـ شوب تو باور! 🤖\n\nأنا هنا لمساعدتك في إيجاد معرف اللاعب الخاص بك، توجيهك لشحن الألعاب بشكل آمن، أو تزويدك بأكواد استرداد ترويجية مجانية!\n\nكيف يمكنني مساعدتك اليوم؟"
            : "Welcome to the Shop2Power Smart Support Center! 🤖\n\nI can help you locate your Player ID, explain secure recharge pathways, or share active coupon vouchers!\n\nHow can I help you today?",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(1).map((m) => ({
            sender: m.sender === "user" ? "user" : "model",
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "bot",
            text: data.text || (isAr ? "عفواً، لم أستطع معالجة الرد." : "Sorry, I couldn't process that response."),
          },
        ]);
      } else {
        throw new Error(data.error || "Server response was not ok");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorMessage(err.message || "Failed to reach AI Server.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-6 z-50 flex flex-col items-end ${isAr ? "left-4 sm:left-6" : "right-4 sm:right-6"}`} dir={isAr ? "rtl" : "ltr"}>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-indigo-600 active:scale-95 transition-all duration-300 group cursor-pointer"
          id="ai-assistant-toggle"
        >
          <MessageSquare className="h-5 w-5 group-hover:rotate-6 transition-all duration-300" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 text-[8px] font-black items-center justify-center text-white">AI</span>
          </span>
        </button>
      )}

      {/* Chat window container */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[80vh] rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white border border-white/10 shadow">
                <Bot className="h-4.5 w-4.5 animate-pulse text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xs font-black leading-none">{isAr ? "الدعم الفني الذكي لشوب تو باور" : "Shop2Power AI Assistant"}</h3>
                <span className="text-[9px] text-slate-300 mt-0.5 block font-medium">
                  {isAr ? "متصل - متاح على مدار الساعة" : "Online - Powered by Gemini"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition rounded p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={msg.id} className={`flex items-start gap-2 max-w-[85%] ${isBot ? "" : "ms-auto flex-row-reverse"}`}>
                  {isBot && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-50 border border-slate-200 text-indigo-600">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      isBot
                        ? "bg-slate-50 text-slate-800 border border-slate-200"
                        : "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-50 border border-slate-200 text-indigo-600">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 flex items-center gap-1.5 border border-slate-200">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
                </div>
              </div>
            )}

            {/* Key Missing / Error Box */}
            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{isAr ? "فشل الاتصال بالخادم الذكي" : "AI Service Unreachable"}</span>
                </div>
                <p className="text-rose-700 leading-relaxed text-[11px]">
                  {isAr
                    ? "عفواً، لا يمكن الاتصال بالذكاء الاصطناعي بسبب فقدان مفتاح الـ API. يرجى تهيئته في لوحة الأسرار (Secrets) لإتاحته."
                    : "Unable to start AI chat session because your GEMINI_API_KEY is not configured. Please supply it in the Secrets panel."}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Predefined suggestion bubbles (only shown if not typing and text box empty) */}
          {!isTyping && !input.trim() && (
            <div className="px-4 py-2.5 border-t border-slate-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-50">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-700 transition shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <HelpCircle className="h-3 w-3 text-indigo-600" />
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Form input bottom */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder={t.chatPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim() && !isTyping) {
                  handleSendMessage(input);
                }
              }}
              disabled={isTyping}
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-base md:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-305 transition shrink-0"
            >
              <Send className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
