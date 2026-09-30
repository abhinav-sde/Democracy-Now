import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addDays, formatLong, isISODate, todayISO } from "../lib/dates.ts";
import { electionsInWindow } from "../lib/schedule.ts";
import type { Country, Election } from "../lib/types.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/data");

function readArg(): string {
  const args = process.argv.slice(2);
  const inline = args.find((arg) => arg.startsWith("--from="));
  if (inline) return inline.slice("--from=".length);
  const index = args.indexOf("--from");
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return todayISO();
}

const from = readArg();
if (!isISODate(from)) {
  console.error("Use --from YYYY-MM-DD");
  process.exit(1);
}

const to = addDays(from, 14);
const countries = JSON.parse(
  readFileSync(path.join(root, "countries.json"), "utf8"),
) as Country[];
const elections = JSON.parse(
  readFileSync(path.join(root, "elections.json"), "utf8"),
) as Election[];
const byId = new Map(countries.map((country) => [country.id, country]));
const rows = electionsInWindow(elections, from, to);

console.log("Democracy This Week");
console.log(`Elections from ${formatLong(from)} through ${formatLong(to)}`);
console.log("");

if (!rows.length) {
  console.log("None on file in this window.");
} else {
  for (const election of rows) {
    const country = byId.get(election.countryId);
    const place = election.subunit
      ? `${election.subunit}, ${country?.name ?? election.countryId}`
      : (country?.name ?? election.countryId);
    console.log(`${formatLong(election.date, election.endDate)}  ${place}`);
    console.log(`  ${election.office}`);
    console.log(`  ${election.level} · ${election.status} · ${election.confidence}`);
    if (election.note) console.log(`  ${election.note}`);
    console.log("");
  }
}

console.log(`${rows.length} election${rows.length === 1 ? "" : "s"} on file.`);
console.log("Next brief: in the content repository, copy episodes/_template.md and keep its four headings.");
