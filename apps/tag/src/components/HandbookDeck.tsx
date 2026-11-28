"use client";

import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { HANDBOOK } from "@/lib/handbook";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.4;
const SCALE_STEP = 0.15;

/** Compact page chips for long decks (keeps first/last + window around current). */
function pageStrip(current: number, total: number): Array<number | "…"> {
  if (total <= 18) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const window = 2;
  const want = new Set<number>([1, total, current]);
  for (let i = current - window; i <= current + window; i++) {
    if (i >= 1 && i <= total) want.add(i);
  }
  for (let i = 2; i <= Math.min(3, total); i++) want.add(i);
  for (let i = Math.max(1, total - 2); i < total; i++) want.add(i);

  const sorted = [...want].sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

export function HandbookDeck({
  page,
  onPageChange,
}: {
  page: number;
  onPageChange: (page: number) => void;
}) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wide, setWide] = useState(false);

  const go = useCallback(
    (next: number) => {
      const max = numPages || 131;
      onPageChange(Math.min(max, Math.max(1, next)));
    },
    [numPages, onPageChange],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(page - 1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(page + 1);
      } else if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
      } else if (e.key === "-" || e.key === "_") {
        setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page]);

  return (
    <div
      className={`handbook-deck panel overflow-hidden rounded-[22px] ${
        wide ? "fixed inset-3 z-40 flex flex-col md:inset-5" : ""
      }`}
      data-testid="handbook-deck"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[rgba(12,27,42,0.04)] px-3 py-2.5 md:px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn border border-[var(--line)] bg-white/70 px-2.5 py-1.5"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => go(page - 1)}
          >
            <ChevronLeft size={18} />
            <span className="hide-mobile">Prev</span>
          </button>
          <button
            type="button"
            className="btn border border-[var(--line)] bg-white/70 px-2.5 py-1.5"
            aria-label="Next page"
            disabled={!numPages || page >= numPages}
            onClick={() => go(page + 1)}
          >
            <span className="hide-mobile">Next</span>
            <ChevronRight size={18} />
          </button>
          <label className="ml-1 flex items-center gap-2 text-sm text-ink-soft">
            <span className="hide-mobile">Page</span>
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={page}
              className="w-14 rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-center font-semibold text-ink"
              onChange={(e) => go(Number(e.target.value) || 1)}
              aria-label="Page number"
            />
            <span className="text-muted">/ {numPages || "—"}</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn border border-[var(--line)] bg-white/70 px-2.5 py-1.5"
            aria-label="Zoom out"
            onClick={() =>
              setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))
            }
          >
            <ZoomOut size={16} />
          </button>
          <span className="min-w-[3.5rem] text-center text-sm font-semibold tabular-nums text-ink">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className="btn border border-[var(--line)] bg-white/70 px-2.5 py-1.5"
            aria-label="Zoom in"
            onClick={() =>
              setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))
            }
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="btn border border-[var(--line)] bg-white/70 px-2.5 py-1.5"
            aria-label={wide ? "Exit wide view" : "Wide view"}
            onClick={() => setWide((w) => !w)}
          >
            {wide ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span className="hide-mobile">{wide ? "Exit" : "Wide"}</span>
          </button>
          <a
            href={`${HANDBOOK.apiUrl}?download=1`}
            className="btn border border-[var(--line)] bg-white/70 px-2.5 py-1.5"
          >
            <Download size={16} />
            <span className="hide-mobile">PDF</span>
          </a>
        </div>
      </div>

      <div
        className={`handbook-stage relative overflow-auto bg-[radial-gradient(ellipse_at_top,rgba(184,240,0,0.08),transparent_55%),linear-gradient(180deg,#e8eef4,#f4f8fb)] ${
          wide ? "flex-1" : "max-h-[min(78vh,920px)] min-h-[520px]"
        }`}
      >
        {loading ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-ink-soft">
            <Loader2 className="mr-2 animate-spin" size={22} />
            Loading handbook…
          </div>
        ) : null}
        {error ? (
          <div className="p-8 text-center text-sm text-red-700">{error}</div>
        ) : null}

        <div className="flex justify-center p-4 md:p-6">
          <Document
            file={HANDBOOK.apiUrl}
            loading={null}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setLoading(false);
              setError("");
            }}
            onLoadError={(err) => {
              setLoading(false);
              setError(err.message || "Could not load handbook PDF.");
            }}
          >
            <Page
              pageNumber={page}
              scale={scale}
              className="handbook-page shadow-[0_18px_50px_rgba(12,27,42,0.18)]"
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
      </div>

      {numPages > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto border-t border-[var(--line)] bg-white/50 px-3 py-2.5">
          {pageStrip(page, numPages).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => go(n)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums transition ${
                  n === page
                    ? "bg-[var(--ink)] text-[#f4f8fb]"
                    : "bg-white/80 text-ink-soft hover:bg-white"
                }`}
                aria-label={`Go to page ${n}`}
                aria-current={n === page ? "page" : undefined}
              >
                {n}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
