"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Lock, User, Bot, Loader2 } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useLanguage } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function Chatbox() {
  const { userId } = useAuth();
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          locale: locale 
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: locale === 'th' ? "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง" : "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pointer-events-none">
            {/* Attraction Bubble */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                y: [0, -4, 0] // Floating effect
              }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ 
                opacity: { delay: 1, duration: 0.5 },
                x: { delay: 1, duration: 0.5 },
                scale: { delay: 1, duration: 0.5 },
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" } // Loop floating
              }}
              className="hidden md:flex items-center gap-3 bg-background border-2 border-accent-sapientia/40 px-5 h-14 rounded-2xl shadow-xl pointer-events-auto cursor-pointer group hover:border-accent-sapientia transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <div className="relative h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-accent-sapientia animate-ping opacity-75"></span>
                <span className="relative block h-2.5 w-2.5 rounded-full bg-accent-sapientia"></span>
              </div>
              <span className="text-sm font-bold text-foreground whitespace-nowrap">
                {t("chat.attract_bubble")}
              </span>
              <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-background border-r-2 border-t-2 border-accent-sapientia/40 rotate-45"></div>
            </motion.div>

            {/* Chat Toggle Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 ring-4 ring-accent-sapientia/20 hover:ring-accent-sapientia/40 group pointer-events-auto cursor-pointer relative"
            >
              <MessageSquare className="h-6 w-6 group-hover:animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-sapientia opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-sapientia border-2 border-background"></span>
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[500px] shadow-2xl rounded-2xl overflow-hidden bg-background border border-border flex flex-col h-[700px]"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight leading-none">{t("chat.header")}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-[12px] text-primary-foreground/80 uppercase font-bold tracking-wider">Your AI Assistant</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors hover:bg-black/10 p-1.5 rounded-md cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto bg-muted/5 space-y-4 scroll-smooth"
            >
              {!userId ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Lock className="h-10 w-10" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground">{t("chat.header")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px]">
                    {t("chat.signin_msg")}
                  </p>
                  <div className="w-full pt-4">
                    <SignInButton mode="modal">
                      <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:translate-y-[-2px] active:translate-y-[0px] cursor-pointer">
                        {t("chat.signin_btn")}
                      </button>
                    </SignInButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1 max-w-[85%]">
                      <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-muted text-sm text-foreground shadow-sm">
                        <p>{t("chat.greeting")}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-1">AI Assistant</span>
                    </div>
                  </div>

                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        m.role === "user" ? "bg-muted text-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`flex flex-col gap-1 max-w-[85%] ${m.role === "user" ? "items-end" : ""}`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          m.role === "user" 
                            ? "rounded-tr-none bg-primary text-primary-foreground" 
                            : "rounded-tl-none bg-background border border-border text-foreground"
                        }`}>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground mx-1">
                          {m.role === "user" ? "You" : "AI Assistant"}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 text-sm flex gap-1 items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground/30 animate-bounce"></div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t border-border bg-background ${!userId ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="relative flex w-full items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={!userId || isLoading}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 h-12 rounded-xl border border-input bg-muted/30 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!userId || !input.trim() || isLoading}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </button>
              </div>
              <div className="text-[10px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-accent-sapientia animate-pulse"></span>
                Let’s find your perfect camera together.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
