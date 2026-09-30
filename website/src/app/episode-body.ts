import { Component, Input } from '@angular/core';
import { Markdown } from './markdown';
import type { Section } from './models';

@Component({
  selector: 'app-episode-body',
  imports: [Markdown],
  template: `
    <div class="episode">
      @for (section of sections; track section.heading; let first = $first) {
        <section [attr.aria-labelledby]="anchor(section.heading)">
          <h2 [id]="anchor(section.heading)">{{ section.heading }}</h2>
          <app-markdown [source]="section.body" [lead]="first" />
        </section>
      }
    </div>
  `,
})
export class EpisodeBody {
  @Input() sections: Section[] = [];

  anchor(heading: string): string {
    return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}
