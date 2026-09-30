import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DeskService } from '../desk.service';
import { Markdown } from '../markdown';

@Component({
  selector: 'app-structure',
  imports: [RouterLink, Markdown],
  templateUrl: './structure.html',
})
export class StructurePage {
  private readonly desk = inject(DeskService);
  private readonly title = inject(Title);
  readonly slug = input.required<string>();

  readonly structure = computed(
    () => this.desk.snapshot()?.structures.find((item) => item.slug === this.slug()) ?? null,
  );

  readonly countries = computed(() => {
    const desk = this.desk.snapshot();
    if (!desk) return [];
    return desk.countries.filter((country) => country.structureSlug === this.slug());
  });

  constructor() {
    effect(() => {
      const structure = this.structure();
      this.title.setTitle(structure ? `${structure.title} · Democracy This Week` : 'Structure · Democracy This Week');
    });
  }
}
