"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string | null;
  tone?: "success" | "warning" | "error" | "info";
  durationMs?: number;
  onClose: () => void;
};

export default function Toast({
  message,
  tone = "success",
  durationMs = 4000,
  onClose
}: ToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(() => {
      onClose();
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className={`toast toast--${tone}`} role="status">
      {message}
    </div>
  );
}
