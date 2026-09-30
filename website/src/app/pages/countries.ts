import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeskService } from '../desk.service';

@Component({
  selector: 'app-countries',
  imports: [RouterLink],
  templateUrl: './countries.html',
})
export class CountriesPage {
  private readonly desk = inject(DeskService);
  readonly countries = computed(() => this.desk.snapshot()?.countries ?? []);
  readonly regions = computed(() => [...new Set(this.countries().map((country) => country.region))].sort());

  inRegion(region: string) {
    return this.countries().filter((country) => country.region === region);
  }
}
