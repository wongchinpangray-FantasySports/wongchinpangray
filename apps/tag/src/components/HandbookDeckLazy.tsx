"use client";

import dynamic from "next/dynamic";

const HandbookDeck = dynamic(
  () => import("@/components/HandbookDeck").then((m) => m.HandbookDeck),
  {
    ssr: false,
    loading: () => (
      <div className="panel flex min-h-[520px] items-center justify-center rounded-[22px] text-ink-soft">
        Loading handbook…
      </div>
    ),
  },
);

export function HandbookDeckLazy() {
  return <HandbookDeck />;
}
