import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  formatLong,
  isISODate,
  monthKey,
  monthLabel,
} from "./dates";
import {
  parseFrontmatter,
  requireList,
  requireString,
  splitSections,
} from "./frontmatter";
import type {
  CalendarRow,
  Confidence,
  Country,
  DatePrecision,
  Election,
  ElectionLevel,
  ElectionStatus,
  Episode,
  EpisodeKind,
  RegimeEvent,
  RegimeKind,
  Source,
  StructureEssay,
  System,
} from "./types";

const root = process.cwd();

const SYSTEMS: System[] = [
  "parliamentary",
  "presidential",
  "semi-presidential",
  "hybrid",
  "transitional",
];

const LEVELS: ElectionLevel[] = ["national", "india-state", "us"];
const STATUSES: ElectionStatus[] = ["scheduled", "held", "postponed", "cancelled"];
const CONFIDENCE: Confidence[] = ["confirmed", "tentative"];
const PRECISIONS: DatePrecision[] = ["day", "month", "year", "tentative"];
const KINDS: EpisodeKind[] = ["poll-week", "preview", "structure", "regime", "subnational"];
const REGIME_KINDS: RegimeKind[] = ["coup", "restoration", "suspension", "transition"];

export interface Desk {
  countries: Country[];
  elections: Election[];
  regimeEvents: RegimeEvent[];
  episodes: Episode[];
  structures: StructureEssay[];
}

export function getDesk(): Desk {
  const structures = loadStructures();
  const countries = loadCountries(new Set(structures.map((item) => item.slug)));
  const countryIds = new Set(countries.map((country) => country.id));
  const elections = loadElections(countryIds);
  const electionIds = new Set(elections.map((election) => election.id));
  return {
    countries,
    elections,
    regimeEvents: loadRegime(countryIds),
    episodes: loadEpisodes(electionIds, new Set(structures.map((item) => item.slug))),
    structures,
  };
}

export function countryById(countries: Country[], id: string): Country | undefined {
  return countries.find((country) => country.id === id);
}

export function structureBySlug(
  structures: StructureEssay[],
  slug: string,
): StructureEssay | undefined {
  return structures.find((structure) => structure.slug === slug);
}

export function electionsForCountry(elections: Election[], countryId: string): Election[] {
  return elections
    .filter((election) => election.countryId === countryId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function toCalendarRows(countries: Country[], elections: Election[]): CalendarRow[] {
  return elections.map((election) => {
    const country = countryById(countries, election.countryId);
    if (!country) throw new Error(`Election ${election.id} has no country`);
    return {
      id: election.id,
      dateLabel: formatLong(election.date, election.endDate),
      sortDate: election.date,
      monthKey: monthKey(election.date),
      monthLabel: monthLabel(monthKey(election.date)),
      country: country.name,
      countryId: country.id,
      region: country.region,
      subunit: election.subunit,
      office: election.office,
      level: election.level,
      status: election.status,
      confidence: election.confidence,
      note: election.note,
    };
  });
}

function loadCountries(structureSlugs: Set<string>): Country[] {
  const rows = readJson("countries.json");
  if (!Array.isArray(rows)) throw new Error("countries.json must be an array");
  const countries = rows.map((row, index) => readCountry(row, index, structureSlugs));
  assertUnique(countries.map((country) => country.id), "country");
  return countries.sort((a, b) => a.name.localeCompare(b.name));
}

function loadElections(countryIds: Set<string>): Election[] {
  const rows = readJson("elections.json");
  if (!Array.isArray(rows)) throw new Error("elections.json must be an array");
  const elections = rows.map((row, index) => readElection(row, index, countryIds));
  assertUnique(elections.map((election) => election.id), "election");
  return elections.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

function loadRegime(countryIds: Set<string>): RegimeEvent[] {
  const rows = readJson("regime-events.json");
  if (!Array.isArray(rows)) throw new Error("regime-events.json must be an array");
  return rows.map((row, index) => readRegime(row, index, countryIds));
}

function loadStructures(): StructureEssay[] {
  const dir = path.join(root, "content", "structures");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const slug = name.replace(/\.md$/, "");
      const raw = readFileSync(path.join(dir, name), "utf8");
      const { data, body } = parseFrontmatter(raw);
      return {
        slug,
        title: requireString(data, "title", name),
        dek: requireString(data, "dek", name),
        body: body.trim(),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function loadEpisodes(electionIds: Set<string>, structureSlugs: Set<string>): Episode[] {
  const dir = path.join(root, "content", "episodes");
  const episodes = readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .map((name) => {
      const raw = readFileSync(path.join(dir, name), "utf8");
      const { data, body } = parseFrontmatter(raw);
      const file = name;
      const kind = requireString(data, "kind", file);
      if (!KINDS.includes(kind as EpisodeKind)) {
        throw new Error(`${file} has an unknown kind: ${kind}`);
      }
      const published = requireString(data, "published", file);
      if (!isISODate(published)) throw new Error(`${file} has a bad published date`);
      const ids = requireList(data, "electionIds", file);
      for (const id of ids) {
        if (!electionIds.has(id)) throw new Error(`${file} cites unknown election ${id}`);
      }
      const structureSlug = requireString(data, "structureSlug", file);
      if (!structureSlugs.has(structureSlug)) {
        throw new Error(`${file} cites unknown structure ${structureSlug}`);
      }
      return {
        slug: name.replace(/\.md$/, ""),
        title: requireString(data, "title", file),
        week: requireString(data, "week", file),
        published,
        kind: kind as EpisodeKind,
        dek: requireString(data, "dek", file),
        electionIds: ids,
        structureSlug,
        sections: splitSections(body, file),
      };
    });
  return episodes.sort((a, b) => a.published.localeCompare(b.published));
}

function readCountry(row: unknown, index: number, structureSlugs: Set<string>): Country {
  const record = asRecord(row, `countries[${index}]`);
  const id = readString(record, "id", `countries[${index}]`);
  const structureSlug = readString(record, "structureSlug", id);
  if (!structureSlugs.has(structureSlug)) {
    throw new Error(`${id} cites unknown structure ${structureSlug}`);
  }
  const system = readString(record, "system", id);
  if (!SYSTEMS.includes(system as System)) throw new Error(`${id} has an unknown system`);
  const termYears = record.termYears;
  if (termYears !== null && typeof termYears !== "number") {
    throw new Error(`${id} termYears must be a number or null`);
  }
  return {
    id,
    name: readString(record, "name", id),
    region: readString(record, "region", id),
    system: system as System,
    systemLabel: readString(record, "systemLabel", id),
    legislature: readString(record, "legislature", id),
    executive: readString(record, "executive", id),
    termYears,
    termLabel: readString(record, "termLabel", id),
    electionInterval: readString(record, "electionInterval", id),
    structureSlug,
    summary: readString(record, "summary", id),
    sources: readSources(record.sources, id),
  };
}

function readElection(row: unknown, index: number, countryIds: Set<string>): Election {
  const label = `elections[${index}]`;
  const record = asRecord(row, label);
  const id = readString(record, "id", label);
  const countryId = readString(record, "countryId", id);
  if (!countryIds.has(countryId)) throw new Error(`${id} cites unknown country ${countryId}`);
  const date = readString(record, "date", id);
  if (!isISODate(date)) throw new Error(`${id} has a bad date`);
  const endDate = optionalString(record, "endDate");
  if (endDate && (!isISODate(endDate) || endDate < date)) {
    throw new Error(`${id} has a bad end date`);
  }
  const level = readString(record, "level", id);
  const status = readString(record, "status", id);
  const confidence = readString(record, "confidence", id);
  const datePrecision = readString(record, "datePrecision", id);
  if (!LEVELS.includes(level as ElectionLevel)) throw new Error(`${id} has a bad level`);
  if (!STATUSES.includes(status as ElectionStatus)) throw new Error(`${id} has a bad status`);
  if (!CONFIDENCE.includes(confidence as Confidence)) throw new Error(`${id} has a bad confidence`);
  if (!PRECISIONS.includes(datePrecision as DatePrecision)) {
    throw new Error(`${id} has a bad date precision`);
  }
  return {
    id,
    countryId,
    subunit: optionalString(record, "subunit"),
    office: readString(record, "office", id),
    date,
    endDate,
    datePrecision: datePrecision as DatePrecision,
    level: level as ElectionLevel,
    status: status as ElectionStatus,
    confidence: confidence as Confidence,
    note: optionalString(record, "note"),
    sources: readSources(record.sources, id),
  };
}

function readRegime(row: unknown, index: number, countryIds: Set<string>): RegimeEvent {
  const label = `regime-events[${index}]`;
  const record = asRecord(row, label);
  const id = readString(record, "id", label);
  const countryId = readString(record, "countryId", id);
  if (!countryIds.has(countryId)) throw new Error(`${id} cites unknown country ${countryId}`);
  const date = readString(record, "date", id);
  if (!isISODate(date)) throw new Error(`${id} has a bad date`);
  const kind = readString(record, "kind", id);
  if (!REGIME_KINDS.includes(kind as RegimeKind)) throw new Error(`${id} has a bad kind`);
  const sources = readSources(record.sources, id);
  return {
    id,
    countryId,
    date,
    kind: kind as RegimeKind,
    summary: readString(record, "summary", id),
    sources,
  };
}

function readJson(name: string): unknown {
  const file = path.join(root, "data", name);
  return JSON.parse(readFileSync(file, "utf8")) as unknown;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string, label: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is missing ${key}`);
  }
  return value.trim();
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error(`${key} must be a string`);
  return value.trim();
}

function readSources(value: unknown, label: string): Source[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} needs at least one source`);
  }
  return value.map((item, index) => {
    const record = asRecord(item, `${label} source ${index}`);
    const url = readString(record, "url", `${label} source ${index}`);
    if (!url.startsWith("https://")) {
      throw new Error(`${label} source ${index} must be an https URL`);
    }
    return { label: readString(record, "label", `${label} source ${index}`), url };
  });
}

function assertUnique(ids: string[], label: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}
