import type { ElectionLevel } from "./types";

export function levelLabel(level: ElectionLevel): string {
  switch (level) {
    case "national":
      return "National";
    case "india-state":
      return "India state";
    case "us":
      return "United States";
  }
}

export function statusLabel(status: string, confidence: string): string {
  if (confidence === "tentative" && status === "scheduled") return "Tentative";
  if (status === "held") return "Held";
  if (status === "scheduled") return "Scheduled";
  if (status === "postponed") return "Postponed";
  if (status === "cancelled") return "Cancelled";
  return status;
}
