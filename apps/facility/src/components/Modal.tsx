"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement>;
  returnFocusRef?: RefObject<HTMLElement>;
  size?: "default" | "wide";
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
};

const focusableSelectors = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  initialFocusRef,
  returnFocusRef,
  size = "default",
  maxWidth,
  maxHeight,
  width,
  height
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    const focusTarget = initialFocusRef?.current ?? titleRef.current ?? panelRef.current;

    if (focusTarget) {
      focusTarget.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusables = panelRef.current
          ? Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelectors))
          : [];
        if (focusables.length === 0) {
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (activeElement) {
        activeElement.focus();
      }
    };
  }, [isOpen, initialFocusRef, onClose, returnFocusRef]);

  if (!isOpen) {
    return null;
  }

  const panelStyle: React.CSSProperties = {
    ...(maxWidth ? { maxWidth } : null),
    ...(maxHeight ? { maxHeight } : null),
    ...(width ? { width } : null),
    ...(height ? { height } : null)
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`modal-panel ${size === "wide" ? "modal-panel--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
        style={panelStyle}
      >
        <div className="modal-close-row">
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-header">
          <h2 id={titleId} ref={titleRef} tabIndex={-1}>
            {title}
          </h2>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
