"use client";

import { ArrowRight, MessageCircle, X } from "lucide-react";
import { FormEvent, RefObject } from "react";

type Message = {
  from: string;
  text: string;
};

type AdvisorChatProps = {
  chatOpen: boolean;
  onToggleChat: () => void;
  onCloseChat: () => void;
  chatTriggerRef: RefObject<HTMLButtonElement | null>;
  chatInputRef: RefObject<HTMLInputElement | null>;
  messages: Message[];
  chatTyping: boolean;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
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
  messagesEndRef,
}: AdvisorChatProps) {
  return (
    <>
      <div
        className={`chat-panel ${chatOpen ? "is-open" : ""}`}
        id="advisor-chat"
        role="dialog"
        aria-labelledby="advisor-chat-title"
        aria-hidden={!chatOpen}
        inert={!chatOpen}
      >
        <header>
          <div className="advisor-header-info">
            <span className="advisor-dot" aria-hidden="true" />
            <div>
              <strong id="advisor-chat-title">Tư vấn TĨNH</strong>
              <small>Trợ lý chọn routine · phản hồi tức thì</small>
            </div>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Đóng chat"
            onClick={onCloseChat}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

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
              <span className="sr-only">Chuyên viên đang nhập</span>
            </p>
          )}
          <span ref={messagesEndRef} aria-hidden="true" />
        </div>

        <form onSubmit={onSendMessage} aria-busy={chatTyping}>
          <label>
            <span className="sr-only">Nhập câu hỏi</span>
            <input
              ref={chatInputRef}
              name="message"
              autoComplete="off"
              placeholder="Hỏi về da hoặc lịch hẹn"
            />
          </label>
          <button type="submit" aria-label="Gửi tin nhắn" disabled={chatTyping}>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </div>

      <button
        className="chat-trigger"
        type="button"
        ref={chatTriggerRef}
        aria-label={chatOpen ? "Đóng tư vấn chat" : "Mở tư vấn chat"}
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
