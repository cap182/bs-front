import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Category } from '../../models/category.model';
import { BookFilter } from '../../../core/stores/book.store';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { priceFilterValidator } from '../../validators/custom-validators';
@Component({
  selector: 'app-book-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    TitleCasePipe,
  ],
  templateUrl: './book-filter.component.html',
  styleUrls: ['./book-filter.component.scss'],

})
export class BookFilterComponent implements OnInit {
  @Input() categories: Category[] | null = [];
  @Input() initialFilter: BookFilter = {};
  @Output() applyFilter = new EventEmitter<BookFilter>();
  @Output() resetFilter = new EventEmitter<void>();

  filterForm!: FormGroup;

  priceFilterTypes = [
    { value: 'equal', viewValue: 'Igual a' },
    { value: 'greater_than', viewValue: 'Mayor que' },
    { value: 'less_than', viewValue: 'Menor que' },
  ];

  constructor(private _snackBar: MatSnackBar, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group(
      {
        category_id: new FormControl(this.initialFilter.category_id || ''),
        price: new FormControl(this.initialFilter.price || null),
        price_filter_type: new FormControl(
          this.initialFilter.price_filter_type || ''
        ),
      },
      { validators: priceFilterValidator }
    );
  }

  get priceControl(): FormControl {
    return this.filterForm.get('price') as FormControl;
  }

  get priceTypeControl(): FormControl {
    return this.filterForm.get('price_filter_type') as FormControl;
  }

  onApplyFilter(): void {
    this.filterForm.markAllAsTouched();

    if (this.filterForm.invalid) {
      if (this.filterForm.errors?.['priceFilterIncomplete']) {
        this._snackBar.open(
          'Debes ingresar un precio Y un tipo de precio, o dejar ambos campos vacíos para filtrar por precio.',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['snackbar-error'],
          }
        );
      }
      return;
    }

    const formValues = this.filterForm.value;

    const cleanFilter: BookFilter = {};
    if (formValues.category_id) {
      cleanFilter.category_id = formValues.category_id;
    }
    if (
      formValues.price !== undefined &&
      formValues.price !== null &&
      formValues.price.toString().trim() !== ''
    ) {
      cleanFilter.price = formValues.price;
    }
    if (formValues.price_filter_type) {
      cleanFilter.price_filter_type = formValues.price_filter_type;
    }

    this.applyFilter.emit(cleanFilter);
  }

  onResetFilter(): void {
    this.filterForm.reset({
      category_id: '',
      price: null,
      price_filter_type: '',
    });
    this.resetFilter.emit();
  }
}
