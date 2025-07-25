// src/app/features/scraping/scraping.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ScrapingLog } from '../../shared/models/scraping-log.model';
import { ScrapingStore, ScrapingState } from '../../core/stores/scraping.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Importa el operador map

@Component({
  selector: 'app-scraping',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './scraping.component.html',
  styleUrls: ['./scraping.component.scss'],
})
export class ScrapingComponent implements OnInit {
  displayedColumns: string[] = ['page', 'category', 'scraped_at', 'number_of_books'];

  // El scrapingState$ sigue exponiendo el estado completo
  // scrubbingState$: Observable<ScrapingState>; // No es necesario si se usan selectores
  
  // Estos son los Observables correctos para usar en el template
  scrapingLogs$: Observable<ScrapingLog[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private scrapingStore: ScrapingStore) {
    // Aquí es donde aplicamos el operador map para extraer la parte del estado que necesitamos
    this.scrapingLogs$ = this.scrapingStore.state$.pipe(map(state => state.logs));
    this.isLoading$ = this.scrapingStore.state$.pipe(map(state => state.isLoading));
    this.error$ = this.scrapingStore.state$.pipe(map(state => state.error));
  }

  ngOnInit(): void {
    this.scrapingStore.loadScrapingLogs();
  }

  refreshLogs(): void {
    this.scrapingStore.loadScrapingLogs();
  }

  displayNA(value: any): string {
    return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ? 'N/A' : value;
  }
}