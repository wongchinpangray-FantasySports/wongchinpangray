import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { HandbookWorkspace } from "@/components/HandbookWorkspace";
import { HANDBOOK } from "@/lib/handbook";

export default function HandbookPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Reference"
        title="SAE Menu"
        description={`${HANDBOOK.title} — ${HANDBOOK.subtitle}. Browse Topics from the Content list, then jump into the page deck.`}
      />
      <Suspense
        fallback={
          <div className="panel flex min-h-[320px] items-center justify-center rounded-[22px] text-ink-soft">
            Loading handbook…
          </div>
        }
      >
        <HandbookWorkspace />
      </Suspense>
      <p className="mt-3 text-sm text-muted">
        Tip: Topics come from the PDF Content page. In Deck view use ← → or Page
        Up / Page Down; + / − to zoom.
      </p>
    </div>
  );
}
