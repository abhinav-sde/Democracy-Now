import { Component, computed, inject, signal } from '@angular/core';
import { DeskService } from '../desk.service';
import { ElectionRows } from '../election-rows';
import { levelLabel } from '../format';
import type { CalendarRow, ElectionLevel } from '../models';

@Component({
  selector: 'app-calendar',
  imports: [ElectionRows],
  templateUrl: './calendar.html',
})
export class CalendarPage {
  private readonly desk = inject(DeskService);
  readonly month = signal('all');
  readonly region = signal('all');
  readonly level = signal('all');
  readonly levelLabel = levelLabel;
  readonly levels: ElectionLevel[] = ['national', 'india-state', 'us'];

  readonly rows = computed(() => this.desk.snapshot()?.rows ?? []);
  readonly months = computed(() => unique(this.rows().map((row) => row.monthKey)));
  readonly regions = computed(() => unique(this.rows().map((row) => row.region)).sort());

  readonly filtered = computed(() =>
    this.rows().filter((row) => {
      if (this.month() !== 'all' && row.monthKey !== this.month()) return false;
      if (this.region() !== 'all' && row.region !== this.region()) return false;
      if (this.level() !== 'all' && row.level !== this.level()) return false;
      return true;
    }),
  );

  readonly coming = computed(() => this.filtered().filter((row) => row.status !== 'held'));
  readonly held = computed(() => this.filtered().filter((row) => row.status === 'held'));

  monthName(key: string): string {
    return this.rows().find((row) => row.monthKey === key)?.monthLabel ?? key;
  }

  monthsOf(rows: CalendarRow[]): string[] {
    return unique(rows.map((row) => row.monthKey));
  }

  inMonth(rows: CalendarRow[], key: string): CalendarRow[] {
    return rows.filter((row) => row.monthKey === key);
  }

  onMonth(event: Event): void {
    this.month.set((event.target as HTMLSelectElement).value);
  }

  onRegion(event: Event): void {
    this.region.set((event.target as HTMLSelectElement).value);
  }

  onLevel(event: Event): void {
    this.level.set((event.target as HTMLSelectElement).value);
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
