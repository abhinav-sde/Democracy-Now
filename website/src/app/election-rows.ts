import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { levelLabel, statusLabel } from './format';
import type { CalendarRow } from './models';

@Component({
  selector: 'app-election-rows',
  imports: [RouterLink],
  template: `
    @if (!rows.length) {
      <p class="empty">Nothing on file.</p>
    } @else {
      <ul class="rows" [class.compact]="compact">
        @for (row of rows; track row.id) {
          <li>
            <p class="when">{{ row.dateLabel }}</p>
            <div>
              <p class="row-title">
                @if (showCountry) {
                  <a [routerLink]="['/countries', row.countryId]">{{ row.subunit || row.country }}</a>
                  @if (row.subunit) {
                    <span class="term">, {{ row.country }}</span>
                  }
                } @else {
                  {{ row.subunit || row.office }}
                }
              </p>
              <p class="row-office">
                @if (showCountry || row.subunit) {
                  {{ row.office }}<span class="term"> · </span>
                }
                <span class="term">{{ levelLabel(row.level) }}</span>
              </p>
              @if (row.note) {
                <p class="note">{{ row.note }}</p>
              }
              @if (row.status === 'held') {
                <p class="held-line">Result not recorded.</p>
              }
            </div>
            <span
              class="badge"
              [class.held]="row.status === 'held'"
              [class.tentative]="row.confidence === 'tentative' && row.status !== 'held'"
            >
              {{ statusLabel(row.status, row.confidence) }}
            </span>
          </li>
        }
      </ul>
    }
  `,
})
export class ElectionRows {
  @Input() rows: CalendarRow[] = [];
  @Input() showCountry = true;
  @Input() compact = false;
  readonly levelLabel = levelLabel;
  readonly statusLabel = statusLabel;
}
