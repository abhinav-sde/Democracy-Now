import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <h1>That page is not on the desk.</h1>
    <p class="stack-link"><a routerLink="/">Back to this week</a></p>
  `,
})
export class NotFoundPage {}
