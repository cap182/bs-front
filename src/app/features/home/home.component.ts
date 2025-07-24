import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Agrega CurrencyPipe
import { BookStore, BookFilter } from '../../core/stores/book.store';
import { Book } from '../../shared/models/book.model';
import { MatDialog } from '@angular/material/dialog';
import { BookDetailsModalComponent } from '../../shared/components/book-details-modal/book-details-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookFilterComponent } from '../../shared/components/book-filter/book-filter.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../shared/components/confirmation-dialog/confirmation-dialog.component'; // Importa el componente de confirmación

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    BookFilterComponent,
    PaginationComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  readonly bookStore = inject(BookStore);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.bookStore.loadBooks({});
    this.bookStore.loadCategories();
  }

  openBookDetails(book: Book): void {
    this.dialog.open(BookDetailsModalComponent, {
      data: book,
      width: '400px',
      panelClass: 'book-details-dialog',
    });
  }

  // NUEVO MÉTODO: Confirmar y eliminar libro
  confirmAndDeleteBook(book: Book): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el libro "${book.title}"? Esta acción no se puede deshacer.`,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'warn', // Usará el color de advertencia de Material
      cancelButtonColor: 'basic',
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si el usuario confirma
        this.bookStore.deleteBook(book.book_id);
      }
    });
  }

  onApplyBookFilter(filter: BookFilter): void {
    this.bookStore.loadBooks({ ...filter, page: 1 });
  }

  onResetBookFilter(): void {
    this.bookStore.resetFilter();
  }

  onPageChange(page: number): void {
    this.bookStore.goToPage(page);
  }

  getBookIndex(index: number): number {
    return (
      (this.bookStore.currentPage() - 1) * this.bookStore.limitPerPage() +
      index +
      1
    );
  }
}
