import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { BookStore, BookFilter } from '../../core/stores/book.store';
import { Book } from '../../shared/models/book.model';
import { MatDialog } from '@angular/material/dialog';
import { BookDetailsModalComponent } from '../../shared/components/book-details-modal/book-details-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookFilterComponent } from '../../shared/components/book-filter/book-filter.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component'; // Importa el componente de paginación

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    BookFilterComponent,
    PaginationComponent, // Agrega el componente de paginación
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  readonly bookStore = inject(BookStore);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    // Cargar los libros inicialmente (sin filtro, con paginación por defecto)
    this.bookStore.loadBooks({});
    // Cargar las categorías al iniciar el componente
    this.bookStore.loadCategories();
  }

  openBookDetails(book: Book): void {
    this.dialog.open(BookDetailsModalComponent, {
      data: book,
      width: '400px',
      panelClass: 'book-details-dialog',
    });
  }

  onApplyBookFilter(filter: BookFilter): void {
    // Al aplicar un filtro, siempre volvemos a la primera página
    this.bookStore.loadBooks({ ...filter, page: 1 });
  }

  onResetBookFilter(): void {
    this.bookStore.resetFilter();
  }

  // Manejador para el evento pageChange del componente de paginación
  onPageChange(page: number): void {
    this.bookStore.goToPage(page);
  }

  // Función para calcular el número de índice de cada libro en la tabla
  getBookIndex(index: number): number {
    return (this.bookStore.currentPage() - 1) * this.bookStore.limitPerPage() + index + 1;
  }
}