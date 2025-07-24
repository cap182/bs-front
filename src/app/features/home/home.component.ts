// src/app/features/home/home.component.ts
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookStore } from '../../core/stores/book.store';
import { Book } from '../../shared/models/book.model';
import { MatDialog } from '@angular/material/dialog';
import { BookDetailsModalComponent } from '../../shared/components/book-details-modal/book-details-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para el spinner de carga
import { MatButtonModule } from '@angular/material/button'; // Para los botones
import { MatIconModule } from '@angular/material/icon'; // Para los iconos

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Usamos OnPush para optimizar
})
export class HomeComponent implements OnInit {
  readonly bookStore = inject(BookStore);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    // Cargar los libros cuando el componente se inicializa
    this.bookStore.loadBooks();
  }

  openBookDetails(book: Book): void {
    this.dialog.open(BookDetailsModalComponent, {
      data: book,
      width: '400px',
      panelClass: 'book-details-dialog', // Clase CSS para estilizar el modal
    });
  }
}