"use client";

import { ImagePlus, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AssistantChatProductCard } from "@/components/assistant/assistant-chat-product-card";
import { ImageSourcePicker } from "@/components/visual-search/image-source-picker";
import type {
  AssistantAction,
  AssistantChoice,
  AssistantResponse,
  ChatMessage,
  ConversationState,
} from "@/lib/assistant/assistant-types";
import {
  ASSISTANT_SESSION_KEY,
  loadAssistantSession,
  saveAssistantSession,
} from "@/lib/assistant/assistant-session";
import { searchByImage, revokeImagePreviewUrl } from "@/lib/visual-search/visual-search-client";
import type { VisualSearchResult } from "@/lib/visual-search/types";
import {
  PASSPORT_ASSISTANT_EVENT,
  type PassportAssistantContext,
} from "@/lib/passport/passport-assistant-bridge";
import { cn } from "@/lib/utils";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AiChatWidget() {
  const t = useTranslations("assistant");
  const tVisual = useTranslations("visualSearch");
  const locale = useLocale() as "ar" | "en";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationState, setConversationState] = useState<Partial<ConversationState>>({});
  const [hydrated, setHydrated] = useState(false);
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
    const onPassportOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ passportContext: PassportAssistantContext }>).detail;
      const ctx = detail?.passportContext;
      if (!ctx) return;

      setConversationState((prev) => ({
        ...prev,
        passportProductSlug: ctx.slug,
        passportVariantId: ctx.variantId ?? undefined,
        passportSku: ctx.sku ?? undefined,
        passportProductNameAr: ctx.nameAr,
        passportProductNameEn: ctx.nameEn,
        passportSource: "passport",
      }));
      setOpen(true);

      const intro =
        locale === "ar"
          ? `أنا جاهز أساعدك بخصوص ${ctx.nameAr}. اسأل عن التركيب، البديل، أو ملاءمة المساحة.`
          : `I'm ready to help with ${ctx.nameEn}. Ask about installation, alternatives, or room fit.`;

      setMessages((prev) => {
        if (prev.some((m) => m.content === intro)) return prev;
        return [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: intro,
            createdAt: Date.now(),
          },
        ];
      });
    };

    window.addEventListener(PASSPORT_ASSISTANT_EVENT, onPassportOpen);
    return () => window.removeEventListener(PASSPORT_ASSISTANT_EVENT, onPassportOpen);
  }, [locale]);

  useEffect(() => {
    const saved = loadAssistantSession();
    if (saved && saved.messages.length > 0) {
      setMessages(
        saved.messages.map((m) => ({
          ...m,
          role: m.role,
        })),
      );
      setConversationState(saved.state ?? {});
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (messages.length === 0 && open) {
      setMessages([
        {
          id: createId(),
          role: "assistant",
          content: t("welcome"),
          createdAt: Date.now(),
        },
      ]);
    }
  }, [open, messages.length, t, hydrated]);

  useEffect(() => {
    if (!hydrated || messages.length === 0) return;
    saveAssistantSession({
      messages: messages.map(({ id, role, content, createdAt }) => ({
        id,
        role,
        content,
        createdAt,
      })),
      state: conversationState,
      updatedAt: Date.now(),
    });
  }, [messages, conversationState, hydrated]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages, typing]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const hasImage = Boolean(attachedFile);
      if ((!trimmed && !hasImage) || typing) return;

      const displayText =
        trimmed ||
        (locale === "ar" ? "أبي شيء يشبه هذا" : "I want something like this");

      const userMsg: ChatMessage = {
        id: createId(),
        role: "user",
        content: displayText,
        createdAt: Date.now(),
        imagePreview: attachedPreview ?? undefined,
      };

      const priorHistory = [...messages, userMsg];
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setTyping(true);

      let visualSearchResult: VisualSearchResult | undefined;
      const fileToSearch = attachedFile;

      if (fileToSearch) {
        try {
          visualSearchResult = await searchByImage({
            file: fileToSearch,
            locale,
            query: trimmed || displayText,
            attributes: conversationState.lastVisualAttributes,
          });
        } catch {
          /* continue without visual result */
        }
      }

      setAttachedFile(null);
      if (attachedPreview) {
        /* keep preview in message; do not revoke until session clear */
      }

      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: displayText,
            locale,
            state: conversationState,
            visualSearchResult,
            history: priorHistory
              .filter((m) => m.role === "user" || m.role === "assistant")
              .slice(-20)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = (await res.json()) as AssistantResponse;
        const reply = data.reply ?? t("fallback");

        if (data.state) {
          setConversationState((prev) => ({
            ...prev,
            ...data.state,
            lastUploadedImagePreview: userMsg.imagePreview ?? prev.lastUploadedImagePreview,
          }));
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: reply,
            createdAt: Date.now(),
            choices: data.choices,
            products: data.products,
            actions: data.actions,
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
    [locale, messages, conversationState, t, typing, attachedFile, attachedPreview],
  );

  const handleImageSelected = (file: File, previewUrl: string) => {
    if (attachedPreview) revokeImagePreviewUrl(attachedPreview);
    setAttachedFile(file);
    setAttachedPreview(previewUrl);
  };

  const clearAttachment = () => {
    if (attachedPreview) revokeImagePreviewUrl(attachedPreview);
    setAttachedFile(null);
    setAttachedPreview(null);
  };

  const clearSession = () => {
    if (attachedPreview) revokeImagePreviewUrl(attachedPreview);
    setAttachedFile(null);
    setAttachedPreview(null);
    setMessages([
      { id: createId(), role: "assistant", content: t("welcome"), createdAt: Date.now() },
    ]);
    setConversationState({});
    sessionStorage.removeItem(ASSISTANT_SESSION_KEY);
  };

  return (
    <>
      <div className="ai-chat-launcher fixed bottom-[calc(var(--mobile-nav-height)+1rem)] left-4 z-50 md:bottom-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "ai-chat-launcher-btn group relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-black-soft text-white shadow-soft transition-all duration-300 hover:scale-[1.03] hover:bg-black",
            open && "pointer-events-none scale-95 opacity-0",
          )}
          aria-label={open ? t("close") : t("open")}
          aria-expanded={open}
        >
          <span className="ai-chat-pulse-ring absolute inset-0 rounded-2xl" aria-hidden="true" />
          <Sparkles className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" strokeWidth={1.5} />
          <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-orange ring-2 ring-white" aria-hidden="true" />
        </button>
      </div>

      <div
        className={cn(
          "ai-chat-panel fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xl transition-all duration-400",
          "bottom-[calc(var(--mobile-nav-height)+5.5rem)] left-4 right-4 max-h-[min(36rem,78svh)] md:bottom-24 md:right-auto md:w-[24rem]",
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0",
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
          <div className="flex shrink-0 gap-1">
            {messages.length > 1 && (
              <button
                type="button"
                onClick={clearSession}
                className="rounded-lg px-2 py-1 text-[10px] text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-orange"
              >
                {t("newChat")}
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} className="icon-btn-premium h-8 w-8" aria-label={t("close")}>
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <MessageBlock key={msg.id} msg={msg} locale={locale} onChoice={sendMessage} />
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
          className="flex flex-col gap-2 border-t border-border/80 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
        >
          {attachedPreview && (
            <div className="relative inline-block w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachedPreview} alt="" className="h-16 rounded-lg border border-border object-cover" />
              <button
                type="button"
                onClick={clearAttachment}
                className="absolute -end-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-black-soft text-white"
                aria-label={tVisual("removeImage")}
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="image-search-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-[#faf9f7] text-brand-black-soft transition-all hover:border-brand-orange/40 hover:bg-brand-orange/5 hover:text-brand-orange active:scale-95 motion-reduce:active:scale-100"
              aria-label={tVisual("attachImage")}
              title={tVisual("attachImage")}
            >
              <ImagePlus className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
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
              disabled={(!input.trim() && !attachedFile) || typing}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white transition-all hover:bg-brand-orange/90 disabled:opacity-40"
              aria-label={t("send")}
            >
              <Send className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
            </button>
          </div>
        </form>

        <ImageSourcePicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onImageSelected={handleImageSelected}
          variant="assistant"
        />
      </div>
    </>
  );
}

function MessageBlock({
  msg,
  locale,
  onChoice,
}: {
  msg: ChatMessage;
  locale: "ar" | "en";
  onChoice: (value: string) => void;
}) {
  return (
    <div className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
      <div
        className={cn(
          "ai-chat-bubble max-w-[92%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          msg.role === "user"
            ? "rounded-ee-sm bg-brand-black-soft text-white"
            : "rounded-es-sm bg-[#f3f2f0] text-brand-black-soft",
        )}
      >
        {msg.imagePreview && (
          <div className="mb-1 max-w-[92%] overflow-hidden rounded-lg border border-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={msg.imagePreview} alt="" className="max-h-32 object-contain" />
          </div>
        )}
        {msg.content}
      </div>

      {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
        <div className="flex w-full max-w-[92%] flex-col gap-2">
          {msg.products.map((card) => (
            <AssistantChatProductCard
              key={card.slug}
              card={card}
              locale={locale}
              compact
              showVisualActions={Boolean(msg.choices?.some((c) => /مشابه|similar/i.test(c.label)))}
              onSimilar={() =>
                onChoice(locale === "ar" ? "وش البديل؟" : "What's the alternative?")
              }
            />
          ))}
        </div>
      )}

      {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
        <div className="flex max-w-[92%] flex-wrap gap-1.5">
          {msg.actions.map((action: AssistantAction) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex rounded-full bg-brand-orange px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-orange/90"
            >
              {locale === "ar" ? action.labelAr : action.labelEn}
            </Link>
          ))}
        </div>
      )}

      {msg.role === "assistant" && msg.choices && msg.choices.length > 0 && (
        <div className="flex max-w-[92%] flex-wrap gap-1.5">
          {msg.choices.map((choice: AssistantChoice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => onChoice(choice.value)}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-brand-black-soft transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
