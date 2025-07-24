import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { BookFilter } from '../../../core/stores/book.store';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-book-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './book-filter.component.html',
  styleUrls: ['./book-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookFilterComponent {
  @Input() categories: Category[] | null = [];
  @Input() initialFilter: BookFilter = {};
  @Output() applyFilter = new EventEmitter<BookFilter>();
  @Output() resetFilter = new EventEmitter<void>();

  filter: BookFilter = {};
  priceFilterTypes = [
    { value: 'equal', viewValue: 'Igual a' },
    { value: 'greater_than', viewValue: 'Mayor que' },
    { value: 'less_than', viewValue: 'Menor que' },
  ];

  ngOnInit(): void {
    // Asegurarse de que el formulario de filtro se inicialice con el filtro actual del store
    this.filter = { ...this.initialFilter };
  }

  onApplyFilter(): void {    
    const cleanFilter: BookFilter = {};
    if (this.filter.category_id) {
      cleanFilter.category_id = this.filter.category_id;
    }
    if (this.filter.price !== undefined && this.filter.price !== null) {
      cleanFilter.price = this.filter.price;
    }
    if (this.filter.price_filter_type) {
      cleanFilter.price_filter_type = this.filter.price_filter_type;
    }

    this.applyFilter.emit(cleanFilter);
  }

  onResetFilter(): void {
    this.filter = {};
    this.resetFilter.emit();
  }
}
