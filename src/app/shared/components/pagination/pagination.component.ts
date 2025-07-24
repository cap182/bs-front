import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() itemsPerPage: number = 1; // Limit per page
  @Input() totalItems: number = 0;   // Total books count

  @Output() pageChange = new EventEmitter<number>();

  // Señales internas para controlar el estado del componente
  _currentPage = signal(1);
  _totalPages = signal(1);
  _totalItems = signal(0);
  _startItem = signal(0);
  _endItem = signal(0);

  // Calcula el rango de páginas a mostrar alrededor de la página actual
  // Esto evita tener una barra de paginación enorme
  visiblePages = signal<number[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage']) {
      this._currentPage.set(this.currentPage);
    }
    if (changes['totalPages']) {
      this._totalPages.set(this.totalPages);
    }
    if (changes['totalItems']) {
      this._totalItems.set(this.totalItems);
    }
    if (changes['currentPage'] || changes['totalPages'] || changes['itemsPerPage'] || changes['totalItems']) {
      this.updateVisiblePages();
      this.updateItemRange();
    }
  }

  private updateVisiblePages(): void {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Por ejemplo, mostrar 5 botones de página (actual + 2 a cada lado)
    let startPage = Math.max(1, this._currentPage() - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this._totalPages(), startPage + maxVisiblePages - 1);

    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    this.visiblePages.set(pages);
  }

  private updateItemRange(): void {
    if (this._totalItems() === 0) {
      this._startItem.set(0);
      this._endItem.set(0);
      return;
    }
    const start = (this._currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(this._currentPage() * this.itemsPerPage, this._totalItems());
    this._startItem.set(start);
    this._endItem.set(end);
  }


  goToPage(page: number): void {
    if (page >= 1 && page <= this._totalPages() && page !== this._currentPage()) {
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    this.goToPage(this._currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this._currentPage() + 1);
  }

  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this._totalPages());
  }
}