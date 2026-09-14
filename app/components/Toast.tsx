"use client";

import { Check, X } from "lucide-react";

export type ToastMessage = {
  id: number;
  message: string;
  tone: "status" | "alert";
};

type ToastProps = {
  toast: ToastMessage | null;
  onDismiss?: () => void;
};

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`toast toast-${toast.tone}`}
      role={toast.tone === "alert" ? "alert" : "status"}
      key={toast.id}
    >
      {toast.tone === "alert" ? (
        <X size={18} aria-hidden="true" />
      ) : (
        <Check size={18} aria-hidden="true" />
      )}
      <span>{toast.message}</span>
      {onDismiss && (
        <button
          type="button"
          className="toast-dismiss"
          aria-label="Đóng thông báo"
          onClick={onDismiss}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
