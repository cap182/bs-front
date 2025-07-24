import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ScrapingComponent } from './features/scraping/scraping.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'scraping', component: ScrapingComponent },
  { path: '**', redirectTo: '/home' }, // Ruta comodín para cualquier otra URL
];