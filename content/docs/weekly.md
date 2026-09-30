# Producing a week of Democracy This Week

Each episode is the ballot lane plus one other lane, so a week stays one sitting.

- **Ballots.** Countries voting in the next 7 to 14 days. This lane is in every episode.
- **Structure.** One comparison: parliamentary, presidential, semi-presidential, a collective presidency, or why two countries use different term lengths.
- **Subnational.** An Indian state assembly, or the United States midterms, House, Senate, or governors.
- **Regime.** Only in a week when the website repository's `public/data/regime-events.json` has a dated event with a source. An empty month is a valid episode. Do not invent a coup or a restoration.

## Make the next brief

1. From the website repository, list the elections already on file:

   ```bash
   npm run fortnight
   ```

   Pass a day if you are planning ahead: `npm run fortnight -- --from 2026-10-13`.

2. Copy [`episodes/_template.md`](../episodes/_template.md) to `episodes/YYYY-wWW-short-name.md`. The new file must not start with `_`. Add that filename to `episodes` in the website repository's `public/content/manifest.json`. A new structure essay is added to `structures` here, and to that same list.

3. Fill the four headings, in order: Open, On the ballot, How this government works, Watch next. Those headings are the published article and the spoken script.

4. Point `electionIds` at rows in the website repository's `public/data/elections.json`, and `structureSlug` at an essay in `structures`.

5. Set `published` to the day the brief should become the one on the front page. A later date stays in the archive as upcoming.

6. Copy `episodes` and `structures` into the website repository at `public/content/episodes` and `public/content/structures`.

## What not to add

- Do not invent a result. Held elections, including the Indian assemblies of April 2026, stay without a winner until a commission source is written into the file.
- Do not add a democracy score. A date means an election is scheduled or was held. Whether it was free and fair is a sourced note, not a rating.
- A regime event is written in the website repository, in `public/data/regime-events.json`. It needs an `id`, a `countryId`, a `date`, a `kind` (`coup`, `restoration`, `suspension`, or `transition`), a one-sentence `summary`, and at least one `https` source. If any of that is missing, leave it out.

```json
{
  "id": "example-id",
  "countryId": "latvia",
  "date": "2026-10-01",
  "kind": "transition",
  "summary": "One sourced sentence.",
  "sources": [{ "label": "Publisher", "url": "https://example.com/story" }]
}
```
