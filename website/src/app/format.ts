import type {
  CalendarRow,
  Confidence,
  Country,
  Election,
  ElectionLevel,
  ElectionStatus,
  Episode,
  EpisodeKind,
  InlinePart,
  ProseBlock,
  Section,
} from './models';

const HEADINGS = ['Open', 'On the ballot', 'How this government works', 'Watch next'];

export function todayISO(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function formatLong(iso: string, end?: string): string {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const asUtc = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };
  if (!end || end === iso) return fmt.format(asUtc(iso));
  const [y1, m1, d1] = iso.split('-').map(Number);
  const [y2, m2, d2] = end.split('-').map(Number);
  if (y1 === y2 && m1 === m2) {
    const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(asUtc(iso));
    return `${d1}–${d2} ${monthName} ${y1}`;
  }
  return `${fmt.format(asUtc(iso))} – ${fmt.format(asUtc(end))}`;
}

export function formatWeekday(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

export function weekLabel(week: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) return week;
  return `Week ${Number(match[2])}, ${match[1]}`;
}

export function levelLabel(level: ElectionLevel): string {
  if (level === 'india-state') return 'India state';
  if (level === 'us') return 'United States';
  return 'National';
}

export function statusLabel(status: ElectionStatus, confidence: Confidence): string {
  if (confidence === 'tentative' && status === 'scheduled') return 'Tentative';
  if (status === 'held') return 'Held';
  if (status === 'scheduled') return 'Scheduled';
  if (status === 'postponed') return 'Postponed';
  if (status === 'cancelled') return 'Cancelled';
  return status;
}

export function badgeTone(status: ElectionStatus, confidence: Confidence): string {
  if (status === 'held') return 'held';
  if (confidence === 'tentative') return 'tentative';
  return '';
}

export function electionsInWindow(elections: Election[], start: string, end: string): Election[] {
  return elections
    .filter((election) => {
      if (election.status === 'cancelled') return false;
      const from = election.date;
      const to = election.endDate ?? election.date;
      return from <= end && to >= start;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function featuredEpisode(episodes: Episode[], today: string): Episode | null {
  const ready = episodes.filter((episode) => episode.published <= today);
  return ready.length ? ready[ready.length - 1] : null;
}

export function upcomingEpisode(episodes: Episode[], today: string): Episode | null {
  return episodes.find((episode) => episode.published > today) ?? null;
}

export function toRows(countries: Country[], elections: Election[]): CalendarRow[] {
  const byId = new Map(countries.map((country) => [country.id, country]));
  return elections.map((election) => {
    const country = byId.get(election.countryId);
    if (!country) throw new Error(`Election ${election.id} has no country`);
    const key = election.date.slice(0, 7);
    return {
      id: election.id,
      dateLabel: formatLong(election.date, election.endDate),
      sortDate: election.date,
      monthKey: key,
      monthLabel: monthLabel(key),
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

export function parseEpisode(file: string, raw: string): Episode {
  const { data, body } = parseFrontmatter(raw);
  const kind = requireString(data, 'kind', file);
  const kinds: EpisodeKind[] = ['poll-week', 'preview', 'structure', 'regime', 'subnational'];
  if (!kinds.includes(kind as EpisodeKind)) throw new Error(`${file} has an unknown kind`);
  return {
    slug: file.replace(/\.md$/, ''),
    title: requireString(data, 'title', file),
    week: requireString(data, 'week', file),
    published: requireString(data, 'published', file),
    kind: kind as EpisodeKind,
    dek: requireString(data, 'dek', file),
    electionIds: requireList(data, 'electionIds', file),
    structureSlug: requireString(data, 'structureSlug', file),
    sections: splitSections(body, file),
  };
}

export function parseStructure(file: string, raw: string): { slug: string; title: string; dek: string; body: string } {
  const { data, body } = parseFrontmatter(raw);
  return {
    slug: file.replace(/\.md$/, ''),
    title: requireString(data, 'title', file),
    dek: requireString(data, 'dek', file),
    body: body.trim(),
  };
}

export function proseBlocks(source: string): ProseBlock[] {
  return source
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      const list = lines.length > 0 && lines.every((line) => line.startsWith('- '));
      const texts = list ? lines.map((line) => line.slice(2)) : [lines.join(' ')];
      return { list, parts: texts.map(inlineParts) };
    });
}

function inlineParts(text: string): InlinePart[] {
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  return text.split(pattern).filter(Boolean).map((part) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    if (bold) return { text: bold[1], bold: true };
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) return { text: link[1], href: link[2] };
    return { text: part };
  });
}

function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) throw new Error('Missing frontmatter');
  const data: Record<string, string | string[]> = {};
  let listKey: string | null = null;
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item) {
      if (!listKey) throw new Error(`List item without a key: ${line}`);
      const list = data[listKey];
      if (!Array.isArray(list)) throw new Error(`${listKey} is not a list`);
      list.push(unquote(item[1].trim()));
      continue;
    }
    const pair = /^([A-Za-z0-9]+):\s*(.*)$/.exec(line);
    if (!pair) throw new Error(`Cannot read frontmatter line: ${line}`);
    if (!pair[2].trim()) {
      data[pair[1]] = [];
      listKey = pair[1];
    } else {
      data[pair[1]] = unquote(pair[2].trim());
      listKey = null;
    }
  }
  return { data, body: match[2] };
}

function requireString(data: Record<string, string | string[]>, key: string, file: string): string {
  const value = data[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${file} is missing ${key}`);
  return value.trim();
}

function requireList(data: Record<string, string | string[]>, key: string, file: string): string[] {
  const value = data[key];
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${file} is missing ${key}`);
  return value;
}

function splitSections(body: string, file: string): Section[] {
  const trimmed = body.trim();
  if (!trimmed.startsWith('## ')) throw new Error(`${file} must start with a ## heading`);
  const sections = trimmed.split(/^## /m).filter(Boolean).map((part) => {
    const newline = part.indexOf('\n');
    return {
      heading: (newline === -1 ? part : part.slice(0, newline)).trim(),
      body: newline === -1 ? '' : part.slice(newline + 1).trim(),
    };
  });
  if (sections.map((section) => section.heading).join('|') !== HEADINGS.join('|')) {
    throw new Error(`${file} must use the four episode headings in order`);
  }
  return sections;
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
