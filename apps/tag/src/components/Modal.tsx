"use client";

import { useEffect } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(12,27,42,0.45)] p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className={`animate-rise panel w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-[18px] p-5 shadow-[var(--shadow)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="brand-mark text-2xl tracking-tight">{title}</h2>
          <button className="btn btn-ghost px-3 py-1" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
