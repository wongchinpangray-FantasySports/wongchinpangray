import { PageHeader } from "@/components/PageHeader";
import { HandbookDeckLazy } from "@/components/HandbookDeckLazy";
import { HANDBOOK } from "@/lib/handbook";

export default function HandbookPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Reference"
        title="SAE Menu"
        description={`${HANDBOOK.title} — ${HANDBOOK.subtitle}. Flip page by page, zoom, or download the original PDF.`}
      />
      <HandbookDeckLazy />
      <p className="mt-3 text-sm text-muted">
        Tip: use ← → or Page Up / Page Down to move between pages; + / − to zoom.
      </p>
    </div>
  );
}
