"use client";

import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AssistantChoice, ChatMessage } from "@/lib/assistant/assistant-types";
import { cn } from "@/lib/utils";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AiChatWidget() {
  const t = useTranslations("assistant");
  const locale = useLocale() as "ar" | "en";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    t("suggestion1"),
    t("suggestion2"),
    t("suggestion3"),
    t("suggestion4"),
    t("suggestion5"),
    t("suggestion6"),
  ];

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: createId(),
          role: "assistant",
          content: t("welcome"),
          createdAt: Date.now(),
        },
      ]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages, typing]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;

      const userMsg: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      const priorHistory = [...messages, userMsg];
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setTyping(true);

      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            locale,
            history: priorHistory
              .filter((m) => m.role === "user" || m.role === "assistant")
              .slice(-20)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = (await res.json()) as { reply?: string; choices?: AssistantChoice[] };
        const reply = data.reply ?? t("fallback");
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: reply,
            createdAt: Date.now(),
            choices: data.choices,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: "assistant", content: t("fallback"), createdAt: Date.now() },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [locale, messages, t, typing],
  );

  return (
    <>
      {/* Launcher — bottom start (left in LTR, right in RTL... user asked BOTTOM LEFT) */}
      <div className="ai-chat-launcher fixed bottom-[calc(var(--mobile-nav-height)+1rem)] left-4 z-50 md:bottom-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "ai-chat-launcher-btn group relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-black-soft text-white shadow-soft transition-all duration-300 hover:scale-[1.03] hover:bg-black",
            open && "scale-95 opacity-0 pointer-events-none",
          )}
          aria-label={open ? t("close") : t("open")}
          aria-expanded={open}
        >
          <span className="ai-chat-pulse-ring absolute inset-0 rounded-2xl" aria-hidden="true" />
          <Sparkles className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" strokeWidth={1.5} />
          <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-orange ring-2 ring-white" aria-hidden="true" />
        </button>
      </div>

      {/* Panel */}
      <div
        className={cn(
          "ai-chat-panel fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xl transition-all duration-400",
          "bottom-[calc(var(--mobile-nav-height)+5.5rem)] left-4 right-4 max-h-[min(32rem,70svh)] md:bottom-24 md:right-auto md:w-[22rem]",
          open ? "translate-y-0 opacity-100 scale-100" : "pointer-events-none translate-y-4 opacity-0 scale-95",
        )}
        aria-hidden={!open}
        role="dialog"
        aria-label={t("title")}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/80 bg-[#faf9f7] px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
              <MessageCircle className="h-4.5 w-4.5" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-brand-black-soft">{t("title")}</h2>
              <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{t("subtitle")}</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="icon-btn-premium h-8 w-8 shrink-0" aria-label={t("close")}>
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "ai-chat-bubble max-w-[92%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-brand-black-soft text-white rounded-ee-sm"
                    : "bg-[#f3f2f0] text-brand-black-soft rounded-es-sm",
                )}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && msg.choices && msg.choices.length > 0 && (
                <div className="flex max-w-[92%] flex-wrap gap-1.5">
                  {msg.choices.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => sendMessage(choice.value)}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-brand-black-soft transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="ai-chat-typing me-auto inline-flex items-center gap-1 rounded-2xl rounded-es-sm bg-[#f3f2f0] px-4 py-3">
              <span /><span /><span />
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 py-3">
            {suggestions.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-brand-black-soft transition-colors hover:border-brand-orange/35 hover:bg-brand-orange/5"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="flex items-center gap-2 border-t border-border/80 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="h-10 flex-1 rounded-xl border border-border bg-[#faf9f7] px-3.5 text-sm outline-none transition-colors focus:border-brand-orange/40 focus:bg-white"
            disabled={typing}
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white transition-all hover:bg-brand-orange/90 disabled:opacity-40"
            aria-label={t("send")}
          >
            <Send className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </>
  );
}
