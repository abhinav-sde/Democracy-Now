export type System =
  | "parliamentary"
  | "presidential"
  | "semi-presidential"
  | "hybrid"
  | "transitional";

export type DatePrecision = "day" | "month" | "year" | "tentative";

export type ElectionLevel = "national" | "india-state" | "us";

export type ElectionStatus = "scheduled" | "held" | "postponed" | "cancelled";

export type Confidence = "confirmed" | "tentative";

export type EpisodeKind =
  | "poll-week"
  | "preview"
  | "structure"
  | "regime"
  | "subnational";

export type RegimeKind = "coup" | "restoration" | "suspension" | "transition";

export interface Source {
  label: string;
  url: string;
}

export interface Country {
  id: string;
  name: string;
  region: string;
  system: System;
  systemLabel: string;
  legislature: string;
  executive: string;
  termYears: number | null;
  termLabel: string;
  electionInterval: string;
  structureSlug: string;
  summary: string;
  sources: Source[];
}

export interface Election {
  id: string;
  countryId: string;
  subunit?: string;
  office: string;
  date: string;
  endDate?: string;
  datePrecision: DatePrecision;
  level: ElectionLevel;
  status: ElectionStatus;
  confidence: Confidence;
  note?: string;
  sources: Source[];
}

export interface RegimeEvent {
  id: string;
  countryId: string;
  date: string;
  kind: RegimeKind;
  summary: string;
  sources: Source[];
}

export interface Section {
  heading: string;
  body: string;
}

export interface Episode {
  slug: string;
  title: string;
  week: string;
  published: string;
  kind: EpisodeKind;
  dek: string;
  electionIds: string[];
  structureSlug: string;
  sections: Section[];
}

export interface StructureEssay {
  slug: string;
  title: string;
  dek: string;
  body: string;
}

export interface CalendarRow {
  id: string;
  dateLabel: string;
  sortDate: string;
  monthKey: string;
  monthLabel: string;
  country: string;
  countryId: string;
  region: string;
  subunit?: string;
  office: string;
  level: ElectionLevel;
  status: ElectionStatus;
  confidence: Confidence;
  note?: string;
}
