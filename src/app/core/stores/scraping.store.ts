import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap, map, startWith } from 'rxjs/operators';
import { ScrapingLog } from '../../shared/models/scraping-log.model';
import { ScrapingService } from '../services/scraping.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ScrapingState {
  logs: ScrapingLog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ScrapingState = {
  logs: [],
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class ScrapingStore {
  private _state = new BehaviorSubject<ScrapingState>(initialState);
  public readonly state$: Observable<ScrapingState> = this._state.asObservable();

  public readonly scrapingLogs$: Observable<ScrapingLog[]> = this._state.pipe(
    map(state => state.logs),
    startWith(initialState.logs)
  );
  public readonly isLoading$: Observable<boolean> = this._state.pipe(
    map(state => state.isLoading),
    startWith(initialState.isLoading)
  );
  public readonly error$: Observable<string | null> = this._state.pipe(
    map(state => state.error),
    startWith(initialState.error)
  );

  constructor(
    private scrapingService: ScrapingService,
    private _snackBar: MatSnackBar
  ) { }

  private updateState(newState: Partial<ScrapingState>): void {
    this._state.next({ ...this._state.getValue(), ...newState });
  }

  loadScrapingLogs(): void {
    if (this._state.getValue().isLoading) {
      return;
    }

    this.updateState({ isLoading: true, error: null });

    this.scrapingService.getScrapingLogs().pipe(
      tap(logs => {
        this.updateState({ logs: logs, isLoading: false });
      }),
      catchError(error => {
        console.error('Error loading scraping logs:', error);
        const errorMessage = 'Error al cargar los registros de scraping. Inténtelo de nuevo más tarde.';
        this.updateState({ error: errorMessage, isLoading: false, logs: [] });
        this._snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
      })
    ).subscribe();
  }
}