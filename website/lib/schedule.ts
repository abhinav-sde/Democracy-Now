import type { Election, Episode } from "./types";

export function overlapsWindow(
  election: Pick<Election, "date" | "endDate">,
  start: string,
  end: string,
): boolean {
  const from = election.date;
  const to = election.endDate ?? election.date;
  return from <= end && to >= start;
}

export function electionsInWindow(
  elections: Election[],
  start: string,
  end: string,
): Election[] {
  return elections
    .filter(
      (election) =>
        election.status !== "cancelled" && overlapsWindow(election, start, end),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function featuredEpisode<T extends Pick<Episode, "published">>(
  episodes: T[],
  today: string,
): T | null {
  const ready = episodes.filter((episode) => episode.published <= today);
  return ready.length ? ready[ready.length - 1] : null;
}

export function upcomingEpisode<T extends Pick<Episode, "published">>(
  episodes: T[],
  today: string,
): T | null {
  return episodes.find((episode) => episode.published > today) ?? null;
}
