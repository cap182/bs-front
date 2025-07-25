import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ScrapingLog } from '../../shared/models/scraping-log.model';
import { Category } from '../../shared/models/category.model';
import { ScrapingStore } from '../../core/stores/scraping.store';
import { BookStore } from '../../core/stores/book.store';
import { ScrapingService } from '../../core/services/scraping.service';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, finalize, catchError, tap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

type ScrapingOption = 'page' | 'category' | 'none';

@Component({
  selector: 'app-scraping',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './scraping.component.html',
  styleUrls: ['./scraping.component.scss'],
})
export class ScrapingComponent implements OnInit {
  scrapingLogs$: Observable<ScrapingLog[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  public bookStore = inject(BookStore);

  scrapingForm: FormGroup;
  categories$: Observable<Category[]>;
  private _isLoadingScrape = new BehaviorSubject<boolean>(false);
  isLoadingScrape$ = this._isLoadingScrape.asObservable();

  constructor(
    private scrapingStore: ScrapingStore,
    private scrapingService: ScrapingService,
    private _snackBar: MatSnackBar
  ) {
    this.scrapingLogs$ = this.scrapingStore.state$.pipe(
      map((state) => state.logs)
    );
    this.isLoading$ = this.scrapingStore.state$.pipe(
      map((state) => state.isLoading)
    );
    this.error$ = this.scrapingStore.state$.pipe(map((state) => state.error));

    this.scrapingForm = new FormGroup({
      scrapeOption: new FormControl<ScrapingOption>('none'),
      pageNumber: new FormControl<number | null>(null),
      categoryId: new FormControl<string | null>(null),
    });

    this.scrapingForm
      .get('scrapeOption')
      ?.valueChanges.subscribe((option: ScrapingOption) => {
        const pageNumberControl = this.scrapingForm.get('pageNumber');
        const categoryIdControl = this.scrapingForm.get('categoryId');

        pageNumberControl?.clearValidators();
        pageNumberControl?.setValue(null);
        categoryIdControl?.clearValidators();
        categoryIdControl?.setValue(null);

        pageNumberControl?.disable();
        categoryIdControl?.disable();

        if (option === 'page') {
          pageNumberControl?.setValidators([
            Validators.required,
            Validators.min(1),
          ]);
          pageNumberControl?.enable();
        } else if (option === 'category') {
          categoryIdControl?.setValidators(Validators.required);
          categoryIdControl?.enable();
        }

        pageNumberControl?.updateValueAndValidity();
        categoryIdControl?.updateValueAndValidity();
      });

    this.categories$ = toObservable(this.bookStore.categories);
  }

  ngOnInit(): void {
    this.scrapingStore.loadScrapingLogs();

    this.bookStore.loadCategories();
  }

  refreshLogs(): void {
    this.scrapingStore.loadScrapingLogs();
  }

  submitScrape(): void {
    this.scrapingForm.markAllAsTouched();
    if (this.scrapingForm.invalid) {
      this._snackBar.open(
        'Por favor, complete los campos obligatorios.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['snackbar-warn'],
        }
      );
      return;
    }

    this._isLoadingScrape.next(true);
    const selectedOption = this.scrapingForm.get('scrapeOption')?.value;
    let body: any = {};

    if (selectedOption === 'page') {
      body = { page: this.scrapingForm.get('pageNumber')?.value };
    } else if (selectedOption === 'category') {
      body = { category: this.scrapingForm.get('categoryId')?.value };
    }

    this.scrapingService
      .postScrapingRequest(body)
      .pipe(
        tap(() => {
          this._snackBar.open(
            'Solicitud de scraping enviada con éxito.',
            'Cerrar',
            {
              duration: 3000,
              panelClass: ['snackbar-success'],
            }
          );
          this.scrapingStore.loadScrapingLogs();
          this.scrapingForm.reset({
            scrapeOption: 'none',
            pageNumber: null,
            categoryId: null,
          });
        }),
        catchError((error) => {
          console.error('Error al enviar la solicitud de scraping:', error);
          const errorMessage =
            error.error?.message ||
            'Error al enviar la solicitud de scraping. Inténtelo de nuevo.';
          this._snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-error'],
          });
          return throwError(() => new Error(errorMessage));
        }),
        finalize(() => {
          this._isLoadingScrape.next(false);
        })
      )
      .subscribe();
  }

  displayNA(value: any): string {
    return value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
      ? 'N/A'
      : value;
  }
}
