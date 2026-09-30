import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DeskService } from '../desk.service';
import { ElectionRows } from '../election-rows';
import { Markdown } from '../markdown';
import { Sources } from '../sources';
import { toRows } from '../format';

@Component({
  selector: 'app-country',
  imports: [RouterLink, ElectionRows, Markdown, Sources],
  templateUrl: './country.html',
})
export class CountryPage {
  private readonly desk = inject(DeskService);
  private readonly title = inject(Title);
  readonly id = input.required<string>();

  readonly country = computed(() => this.desk.snapshot()?.countries.find((item) => item.id === this.id()) ?? null);

  readonly structure = computed(() => {
    const country = this.country();
    const desk = this.desk.snapshot();
    if (!country || !desk) return null;
    return desk.structures.find((item) => item.slug === country.structureSlug) ?? null;
  });

  readonly elections = computed(() => {
    const country = this.country();
    const desk = this.desk.snapshot();
    if (!country || !desk) return [];
    return toRows(
      desk.countries,
      desk.elections.filter((election) => election.countryId === country.id),
    );
  });

  constructor() {
    effect(() => {
      const country = this.country();
      this.title.setTitle(country ? `${country.name} · Democracy This Week` : 'Country · Democracy This Week');
    });
  }
}
