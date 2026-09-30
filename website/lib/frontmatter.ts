import type { Section } from "./types";

export const EPISODE_HEADINGS = [
  "Open",
  "On the ballot",
  "How this government works",
  "Watch next",
] as const;

export function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing frontmatter. Start the file with a --- block.");
  }
  const data: Record<string, string | string[]> = {};
  let listKey: string | null = null;
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item) {
      if (!listKey) throw new Error(`List item without a key: ${line}`);
      const list = data[listKey];
      if (!Array.isArray(list)) throw new Error(`${listKey} is not a list`);
      list.push(unquote(item[1].trim()));
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9]+):\s*(.*)$/);
    if (!pair) throw new Error(`Cannot read frontmatter line: ${line}`);
    const key = pair[1];
    const value = pair[2].trim();
    if (!value) {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = unquote(value);
      listKey = null;
    }
  }
  return { data, body: match[2] };
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function requireString(
  data: Record<string, string | string[]>,
  key: string,
  file: string,
): string {
  const value = data[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${file} is missing ${key}`);
  }
  return value.trim();
}

export function requireList(
  data: Record<string, string | string[]>,
  key: string,
  file: string,
): string[] {
  const value = data[key];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${file} is missing ${key}`);
  }
  return value;
}

export function splitSections(body: string, file: string): Section[] {
  const trimmed = body.trim();
  if (!trimmed.startsWith("## ")) {
    throw new Error(`${file} must start with a ## heading`);
  }
  const sections = trimmed
    .split(/^## /m)
    .filter(Boolean)
    .map((part) => {
      const newline = part.indexOf("\n");
      const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
      const text = newline === -1 ? "" : part.slice(newline + 1).trim();
      return { heading, body: text };
    });
  const found = sections.map((section) => section.heading).join("|");
  const expected = EPISODE_HEADINGS.join("|");
  if (found !== expected) {
    throw new Error(
      `${file} must use these headings, in order: ${EPISODE_HEADINGS.join(", ")}`,
    );
  }
  return sections;
}
