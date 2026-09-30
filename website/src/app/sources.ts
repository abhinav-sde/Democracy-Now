import { Component, Input } from '@angular/core';
import type { Source } from './models';

@Component({
  selector: 'app-sources',
  template: `
    <ul class="sources">
      @for (source of sources; track source.url) {
        <li><a [href]="source.url" rel="noreferrer">{{ source.label }}</a></li>
      }
    </ul>
  `,
})
export class Sources {
  @Input() sources: Source[] = [];
}
