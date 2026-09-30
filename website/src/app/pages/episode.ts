import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DeskService } from '../desk.service';
import { ElectionRows } from '../election-rows';
import { EpisodeBody } from '../episode-body';
import { toRows, weekLabel } from '../format';

@Component({
  selector: 'app-episode',
  imports: [RouterLink, EpisodeBody, ElectionRows],
  templateUrl: './episode.html',
})
export class EpisodePage {
  private readonly desk = inject(DeskService);
  private readonly title = inject(Title);
  readonly slug = input.required<string>();
  readonly weekLabel = weekLabel;

  readonly episode = computed(() => this.desk.snapshot()?.episodes.find((item) => item.slug === this.slug()) ?? null);

  readonly structure = computed(() => {
    const episode = this.episode();
    const desk = this.desk.snapshot();
    if (!episode || !desk) return null;
    return desk.structures.find((item) => item.slug === episode.structureSlug) ?? null;
  });

  readonly rows = computed(() => {
    const episode = this.episode();
    const desk = this.desk.snapshot();
    if (!episode || !desk) return [];
    return toRows(
      desk.countries,
      desk.elections.filter((election) => episode.electionIds.includes(election.id)),
    );
  });

  constructor() {
    effect(() => {
      const episode = this.episode();
      this.title.setTitle(episode ? `${episode.title} · Democracy This Week` : 'Episode · Democracy This Week');
    });
  }
}
