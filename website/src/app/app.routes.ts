import { Routes } from '@angular/router';
import { CalendarPage } from './pages/calendar';
import { CountriesPage } from './pages/countries';
import { CountryPage } from './pages/country';
import { EpisodePage } from './pages/episode';
import { EpisodesPage } from './pages/episodes';
import { HomePage } from './pages/home';
import { NotFoundPage } from './pages/not-found';
import { StructurePage } from './pages/structure';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Democracy This Week' },
  { path: 'calendar', component: CalendarPage, title: 'Calendar · Democracy This Week' },
  { path: 'countries', component: CountriesPage, title: 'Countries · Democracy This Week' },
  { path: 'countries/:id', component: CountryPage },
  { path: 'episodes', component: EpisodesPage, title: 'Episodes · Democracy This Week' },
  { path: 'episodes/:slug', component: EpisodePage },
  { path: 'structures/:slug', component: StructurePage },
  { path: '**', component: NotFoundPage, title: 'Not found · Democracy This Week' },
];
