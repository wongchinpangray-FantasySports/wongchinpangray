"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpenText, ListTree } from "lucide-react";
import { HandbookDeckLazy } from "@/components/HandbookDeckLazy";
import {
  getSaeTopic,
  SAE_TOPICS,
  topicForPage,
  type SaeTopic,
} from "@/lib/sae-topics";

type Mode = "topics" | "deck";

function parsePage(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(SAE_TOPICS.numPages, Math.floor(n));
}

export function HandbookWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [topicId, setTopicId] = useState(
    () => getSaeTopic(searchParams.get("topic"))?.id ?? SAE_TOPICS.topics[0].id,
  );
  const [page, setPage] = useState(() => {
    const topic =
      getSaeTopic(searchParams.get("topic")) ?? SAE_TOPICS.topics[0];
    const pageParam = searchParams.get("page");
    return pageParam ? parsePage(pageParam) : topic.pdfPageStart;
  });
  const [mode, setMode] = useState<Mode>(() =>
    searchParams.get("view") === "deck" ? "deck" : "topics",
  );

  const topic = useMemo(
    () => getSaeTopic(topicId) ?? SAE_TOPICS.topics[0],
    [topicId],
  );

  const syncUrl = useCallback(
    (next: { topicId?: string; page?: number; mode?: Mode }) => {
      const params = new URLSearchParams(searchParams.toString());
      const t = next.topicId ?? topicId;
      const p = next.page ?? page;
      const m = next.mode ?? mode;
      params.set("topic", t);
      params.set("page", String(p));
      params.set("view", m);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [mode, page, pathname, router, searchParams, topicId],
  );

  function selectTopic(next: SaeTopic) {
    setTopicId(next.id);
    setPage(next.pdfPageStart);
    setMode("topics");
    syncUrl({ topicId: next.id, page: next.pdfPageStart, mode: "topics" });
  }

  function openInDeck(nextPage = topic.pdfPageStart) {
    setPage(nextPage);
    setMode("deck");
    syncUrl({ page: nextPage, mode: "deck" });
  }

  function onDeckPageChange(nextPage: number) {
    setPage(nextPage);
    const match = topicForPage(nextPage) || getSaeTopic("contents");
    if (match && match.id !== topicId) setTopicId(match.id);
    syncUrl({
      page: nextPage,
      topicId: match?.id ?? topicId,
      mode: "deck",
    });
  }

  return (
    <div className="space-y-4" data-testid="handbook-workspace">
      <div className="panel flex flex-wrap items-center justify-between gap-3 rounded-[22px] p-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn px-3 py-1.5 ${
              mode === "topics"
                ? "bg-[var(--ink)] text-[#f4f8fb]"
                : "border border-[var(--line)] bg-white/70"
            }`}
            onClick={() => {
              setMode("topics");
              syncUrl({ mode: "topics" });
            }}
            data-testid="handbook-view-topics"
          >
            <ListTree size={16} />
            Topics
          </button>
          <button
            type="button"
            className={`btn px-3 py-1.5 ${
              mode === "deck"
                ? "bg-[var(--ink)] text-[#f4f8fb]"
                : "border border-[var(--line)] bg-white/70"
            }`}
            onClick={() => openInDeck(page)}
            data-testid="handbook-view-deck"
          >
            <BookOpenText size={16} />
            Deck
          </button>
        </div>
        <p className="text-sm text-muted">
          From Content (PDF p.{SAE_TOPICS.tocPage}) — jump targets use section
          dividers in this file.
        </p>
      </div>

      {mode === "topics" ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside
            className="panel rounded-[22px] p-3"
            data-testid="handbook-topics"
          >
            <div className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Topics
            </div>
            <ul className="flex flex-col gap-1">
              {SAE_TOPICS.topics.map((item) => {
                const active = item.id === topic.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectTopic(item)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                        active
                          ? "bg-[rgba(27,122,78,0.14)] text-ink"
                          : "hover:bg-white/70 text-ink-soft"
                      }`}
                      data-testid={`topic-${item.id}`}
                    >
                      <div className="font-semibold leading-snug">
                        {item.tocTitle}
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        Deck p.{item.pdfPageStart}
                        {item.pdfPageEnd !== item.pdfPageStart
                          ? `–${item.pdfPageEnd}`
                          : ""}
                        {item.tocPrintedRange
                          ? ` · TOC ${item.tocPrintedRange}`
                          : ""}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section
            className="panel rounded-[22px] p-5 md:p-6"
            data-testid="handbook-topic-detail"
          >
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Selected topic
            </div>
            <h2 className="brand-mark text-3xl leading-none">{topic.tocTitle}</h2>
            {topic.sectionTitle && topic.sectionTitle !== topic.tocTitle ? (
              <p className="mt-2 text-sm font-semibold text-verdant-deep">
                Section divider: {topic.sectionTitle}
              </p>
            ) : null}
            <p className="mt-2 text-sm text-muted">
              Deck pages {topic.pdfPageStart}
              {topic.pdfPageEnd !== topic.pdfPageStart
                ? `–${topic.pdfPageEnd}`
                : ""}
              {topic.printedPageStart
                ? ` · printed p.${topic.printedPageStart}`
                : ""}
              {topic.tocPrintedRange
                ? ` · Content lists ${topic.tocPrintedRange}`
                : ""}
            </p>
            {topic.note ? (
              <p className="mt-3 rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm text-ink-soft">
                {topic.note}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn bg-[var(--ink)] text-[#f4f8fb]"
                onClick={() => openInDeck(topic.pdfPageStart)}
              >
                Open in deck → p.{topic.pdfPageStart}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                Extracted text from this section
              </div>
              {topic.excerpts.map((ex) => (
                <article
                  key={ex.pdfPage}
                  className="surface rounded-2xl px-4 py-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-verdant-deep"
                      onClick={() => openInDeck(ex.pdfPage)}
                    >
                      Deck page {ex.pdfPage}
                      {ex.printedPage ? ` (printed ${ex.printedPage})` : ""}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-[0.98rem] leading-relaxed text-ink-soft">
                    {ex.text}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-soft">
              Showing{" "}
              <strong className="text-ink">{topic.tocTitle}</strong>
              {" · "}
              deck page {page}
            </p>
            <button
              type="button"
              className="btn border border-[var(--line)] bg-white/70 px-3 py-1.5"
              onClick={() => {
                setMode("topics");
                syncUrl({ mode: "topics" });
              }}
            >
              Back to Topics
            </button>
          </div>
          <HandbookDeckLazy page={page} onPageChange={onDeckPageChange} />
        </div>
      )}
    </div>
  );
}
