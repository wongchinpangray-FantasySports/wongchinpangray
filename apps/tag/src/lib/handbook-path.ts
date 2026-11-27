import path from "path";
import { HANDBOOK } from "./handbook";

/** Absolute path to the committed handbook PDF (server only). */
export function getHandbookFilePath() {
  return path.join(
    process.cwd(),
    "content",
    "handbooks",
    HANDBOOK.filename,
  );
}
