import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeskService } from '../desk.service';
import { ElectionRows } from '../election-rows';
import { EpisodeBody } from '../episode-body';
import { addDays, electionsInWindow, featuredEpisode, monthLabel, todayISO, toRows, upcomingEpisode, weekLabel } from '../format';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ElectionRows, EpisodeBody],
  templateUrl: './home.html',
})
export class HomePage {
  private readonly desk = inject(DeskService);
  readonly today = todayISO();
  readonly weekLabel = weekLabel;
  readonly month = monthLabel(this.today.slice(0, 7));

  readonly episode = computed(() => {
    const desk = this.desk.snapshot();
    return desk ? featuredEpisode(desk.episodes, this.today) : null;
  });

  readonly next = computed(() => {
    const desk = this.desk.snapshot();
    return desk ? upcomingEpisode(desk.episodes, this.today) : null;
  });

  readonly fortnight = computed(() => {
    const desk = this.desk.snapshot();
    if (!desk) return [];
    return toRows(desk.countries, electionsInWindow(desk.elections, this.today, addDays(this.today, 14)));
  });

  readonly structure = computed(() => {
    const desk = this.desk.snapshot();
    const episode = this.episode();
    if (!desk || !episode) return null;
    return desk.structures.find((item) => item.slug === episode.structureSlug) ?? null;
  });

  readonly regime = computed(() => {
    const desk = this.desk.snapshot();
    if (!desk) return [];
    return desk.regimeEvents.filter((event) => event.date.slice(0, 7) === this.today.slice(0, 7));
  });

  countryName(id: string): string {
    return this.desk.snapshot()?.countries.find((country) => country.id === id)?.name ?? id;
  }
}
