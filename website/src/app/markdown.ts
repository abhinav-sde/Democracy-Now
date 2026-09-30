import { NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { proseBlocks } from './format';
import type { ProseBlock } from './models';

@Component({
  selector: 'app-markdown',
  imports: [NgTemplateOutlet],
  template: `
    <div class="prose" [class.lead]="lead">
      @for (block of blocks; track $index) {
        @if (block.list) {
          <ul>
            @for (item of block.parts; track $index) {
              <li><ng-container [ngTemplateOutlet]="inline" [ngTemplateOutletContext]="{ parts: item }" /></li>
            }
          </ul>
        } @else {
          <p><ng-container [ngTemplateOutlet]="inline" [ngTemplateOutletContext]="{ parts: block.parts[0] }" /></p>
        }
      }
    </div>
    <ng-template #inline let-parts="parts">
      @for (part of parts; track $index) {
        @if (part.bold) {
          <strong>{{ part.text }}</strong>
        } @else if (part.href) {
          <a [href]="part.href">{{ part.text }}</a>
        } @else {
          {{ part.text }}
        }
      }
    </ng-template>
  `,
})
export class Markdown {
  @Input() source = '';
  @Input() lead = false;

  get blocks(): ProseBlock[] {
    return proseBlocks(this.source);
  }
}
