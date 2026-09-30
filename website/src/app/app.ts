import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DeskService } from './desk.service';
import { formatWeekday, todayISO } from './format';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  private readonly desk = inject(DeskService);
  protected readonly ready = signal(false);
  protected readonly failed = signal(false);
  protected readonly today = formatWeekday(todayISO());

  constructor() {
    void this.desk.load().then(
      () => this.ready.set(true),
      () => this.failed.set(true),
    );
  }
}
