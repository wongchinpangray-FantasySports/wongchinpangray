import topicsData from "@/data/sae-menu-topics.json";

export type SaeTopicExcerpt = {
  pdfPage: number;
  printedPage: number | null;
  text: string;
};

export type SaeTopic = {
  id: string;
  tocTitle: string;
  tocPrintedRange: string | null;
  sectionTitle: string | null;
  pdfPageStart: number;
  pdfPageEnd: number;
  printedPageStart: number | null;
  note: string | null;
  excerpts: SaeTopicExcerpt[];
};

export type SaeTopicsPayload = {
  sourceFile: string;
  sourceLabel: string;
  numPages: number;
  tocPage: number;
  extractedFrom: string;
  topics: SaeTopic[];
};

export const SAE_TOPICS = topicsData as SaeTopicsPayload;

export function getSaeTopic(id: string | null | undefined): SaeTopic | undefined {
  if (!id) return undefined;
  return SAE_TOPICS.topics.find((t) => t.id === id);
}

export function topicForPage(page: number): SaeTopic | undefined {
  return SAE_TOPICS.topics.find(
    (t) =>
      t.id !== "acronyms" &&
      t.id !== "contents" &&
      page >= t.pdfPageStart &&
      page <= t.pdfPageEnd,
  );
}
