import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeskService } from '../desk.service';
import { featuredEpisode, todayISO, weekLabel } from '../format';

@Component({
  selector: 'app-episodes',
  imports: [RouterLink],
  templateUrl: './episodes.html',
})
export class EpisodesPage {
  private readonly desk = inject(DeskService);
  readonly today = todayISO();
  readonly weekLabel = weekLabel;
  readonly episodes = computed(() => [...(this.desk.snapshot()?.episodes ?? [])].reverse());
  readonly current = computed(() => {
    const desk = this.desk.snapshot();
    return desk ? featuredEpisode(desk.episodes, this.today) : null;
  });
}
