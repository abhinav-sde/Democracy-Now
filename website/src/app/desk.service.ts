import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { parseEpisode, parseStructure, toRows } from './format';
import type { Country, Desk, Election, Manifest, RegimeEvent } from './models';

@Injectable({ providedIn: 'root' })
export class DeskService {
  private readonly http = inject(HttpClient);
  readonly snapshot = signal<Desk | null>(null);

  load(): Promise<void> {
    return firstValueFrom(
      forkJoin({
        countries: this.http.get<Country[]>('data/countries.json'),
        elections: this.http.get<Election[]>('data/elections.json'),
        regimeEvents: this.http.get<RegimeEvent[]>('data/regime-events.json'),
        manifest: this.http.get<Manifest>('content/manifest.json'),
      }),
    ).then(async (base) => {
      const episodes = await Promise.all(
        base.manifest.episodes.map((file) =>
          firstValueFrom(this.http.get(`content/episodes/${file}`, { responseType: 'text' })).then((raw) =>
            parseEpisode(file, raw),
          ),
        ),
      );
      const structures = await Promise.all(
        base.manifest.structures.map((file) =>
          firstValueFrom(this.http.get(`content/structures/${file}`, { responseType: 'text' })).then((raw) =>
            parseStructure(file, raw),
          ),
        ),
      );
      const countries = [...base.countries].sort((a, b) => a.name.localeCompare(b.name));
      const elections = [...base.elections].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
      episodes.sort((a, b) => a.published.localeCompare(b.published));
      this.snapshot.set({
        countries,
        elections,
        regimeEvents: base.regimeEvents,
        episodes,
        structures,
        rows: toRows(countries, elections),
      });
    });
  }
}
