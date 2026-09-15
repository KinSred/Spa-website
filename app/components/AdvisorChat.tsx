"use client";

import { ArrowRight, MessageCircle, Sparkles, X } from "lucide-react";
import { FormEvent, RefObject } from "react";

export type ConciergeIntent =
  | "sensitive-routine"
  | "recovery-products"
  | "treatments"
  | "booking";

export type ChatMessage = {
  from: "user" | "advisor";
  text: string;
};

type AdvisorChatProps = {
  chatOpen: boolean;
  onToggleChat: () => void;
  onCloseChat: () => void;
  chatTriggerRef: RefObject<HTMLButtonElement | null>;
  chatInputRef: RefObject<HTMLInputElement | null>;
  messages: ChatMessage[];
  chatTyping: boolean;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onIntent: (intent: ConciergeIntent) => void;
  messagesEndRef: RefObject<HTMLSpanElement | null>;
};

export function AdvisorChat({
  chatOpen,
  onToggleChat,
  onCloseChat,
  chatTriggerRef,
  chatInputRef,
  messages,
  chatTyping,
  onSendMessage,
  onIntent,
  messagesEndRef,
}: AdvisorChatProps) {
  const quickIntents: { label: string; intent: ConciergeIntent }[] = [
    { label: "Chọn routine cho da nhạy cảm", intent: "sensitive-routine" },
    { label: "Tìm sản phẩm phục hồi", intent: "recovery-products" },
    { label: "Xem liệu trình", intent: "treatments" },
    { label: "Đặt lịch tư vấn", intent: "booking" },
  ];

  return (
    <>
      <div
        className={`chat-panel concierge-panel ${chatOpen ? "is-open" : ""}`}
        id="advisor-chat"
        role="region"
        aria-labelledby="advisor-chat-title"
        aria-hidden={!chatOpen}
        inert={!chatOpen}
      >
        <header className="concierge-header">
          <div className="advisor-header-info">
            <span className="concierge-badge" aria-hidden="true">
              <Sparkles size={14} />
            </span>
            <div>
              <strong id="advisor-chat-title">TĨNH Concierge</strong>
              <small>Trợ lý tìm kiếm routine &amp; liệu trình</small>
            </div>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Đóng trợ lý tư vấn"
            onClick={onCloseChat}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Quick Welcome Intent Options */}
        <div className="concierge-quick-strip" aria-label="Gợi ý nhanh">
          <span>Gợi ý khám phá:</span>
          <div className="quick-buttons-row">
            {quickIntents.map((item) => (
              <button
                key={item.intent}
                type="button"
                className="quick-intent-pill"
                onClick={() => onIntent(item.intent)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="chat-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message, index) => (
            <p className={message.from} key={`${message.from}-${index}`}>
              {message.text}
            </p>
          ))}
          {chatTyping && (
            <p className="advisor typing-message">
              <span />
              <span />
              <span />
              <span className="sr-only">Đang tìm thông tin phù hợp</span>
            </p>
          )}
          <span ref={messagesEndRef} aria-hidden="true" />
        </div>

        <form className="concierge-input-form" onSubmit={onSendMessage} aria-busy={chatTyping}>
          <label>
            <span className="sr-only">Nhập câu hỏi về da hoặc liệu trình</span>
            <input
              ref={chatInputRef}
              name="message"
              autoComplete="off"
              placeholder="Hỏi về sản phẩm, loại da hoặc dịch vụ…"
            />
          </label>
          <button type="submit" aria-label="Gửi tin nhắn" disabled={chatTyping}>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </div>

      <button
        className="chat-trigger concierge-trigger"
        type="button"
        ref={chatTriggerRef}
        aria-label={chatOpen ? "Đóng trợ lý tư vấn" : "Mở trợ lý tư vấn"}
        aria-expanded={chatOpen}
        aria-controls="advisor-chat"
        onClick={onToggleChat}
      >
        {chatOpen ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <MessageCircle size={20} aria-hidden="true" />
        )}
        <span>{chatOpen ? "Đóng" : "Tư vấn"}</span>
      </button>
    </>
  );
}
