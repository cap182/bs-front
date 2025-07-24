import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Book, BooksApiResponse } from '../../shared/models/book.model';
import { BookService } from '../services/book.service';
import { take } from 'rxjs';
import { Category } from '../../shared/models/category.model';

export interface BookFilter {
  category_id?: string;
  price?: number;
  price_filter_type?: 'greater_than' | 'less_than' | 'equal';
  page?: number;
  limit?: number;
}

export interface BookState {
  books: Book[];
  categories: Category[];
  isLoading: boolean;
  isLoadingCategories: boolean;
  isDeleting: boolean;
  error: string | null;
  currentFilter: BookFilter;
  totalBooksCount: number;
  currentPage: number;
  limitPerPage: number;
}

const initialState: BookState = {
  books: [],
  categories: [],
  isLoading: false,
  isLoadingCategories: false,
  isDeleting: false,
  error: null,
  currentFilter: {},
  totalBooksCount: 0,
  currentPage: 1,
  limitPerPage: 30,
};

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    activeFilter: computed(() => store.currentFilter()),
    totalPages: computed(() => Math.ceil(store.totalBooksCount() / store.limitPerPage())),
  })),
  withMethods((store) => {
    const bookService = inject(BookService);

    return {
      async loadBooks(filter?: BookFilter): Promise<void> {
        const newFilter = {
          ...store.currentFilter(),
          page: filter?.page ?? store.currentPage(),
          limit: filter?.limit ?? store.limitPerPage(),
          ...(filter || {})
        };

        if (store.isLoading() && JSON.stringify(store.currentFilter()) === JSON.stringify(newFilter)) {
          return;
        }

        patchState(store, { isLoading: true, error: null, currentFilter: newFilter });
        try {
          const response = await bookService.getBooks(newFilter).pipe(take(1)).toPromise();
          if (response) {
            patchState(store, {
              books: response.data,
              isLoading: false,
              totalBooksCount: response.total,
              currentPage: response.page,
              limitPerPage: response.limit,
            });
          }
        } catch (error: any) {
          console.error('Error loading books:', error);
          patchState(store, {
            error: error.message || 'Failed to load books',
            isLoading: false,
          });
        }
      },

      async loadCategories(): Promise<void> {
        if (store.isLoadingCategories()) return;

        patchState(store, { isLoadingCategories: true, error: null });
        try {
          const categories = await bookService.getCategories().pipe(take(1)).toPromise();
          if (categories) {
            patchState(store, { categories: categories, isLoadingCategories: false });
          }
        } catch (error: any) {
          console.error('Error loading categories:', error);
          patchState(store, {
            error: error.message || 'Failed to load categories',
            isLoadingCategories: false,
          });
        }
      },

      async deleteBook(bookId: string): Promise<void> {
        patchState(store, { isDeleting: true, error: null });
        try {
          await bookService.deleteBook(bookId).pipe(take(1)).toPromise();
          await this.loadBooks(store.currentFilter());
          patchState(store, { isDeleting: false });
        } catch (error: any) {
          console.error(`Error deleting book with ID ${bookId}:`, error);
          patchState(store, {
            error: error.message || `Failed to delete book with ID ${bookId}`,
            isDeleting: false,
          });
          alert(`Error al eliminar el libro, intente nuevamente.`);
        }
      },

      clearBooks(): void {
        patchState(store, { books: [], isLoading: false, error: null, totalBooksCount: 0, currentPage: 1 });
      },

      setFilter(filter: BookFilter): void {
        patchState(store, { currentFilter: filter });
      },

      resetFilter(): void {
        patchState(store, { currentFilter: {}, currentPage: 1 });
        this.loadBooks({});
      },

      goToPage(page: number): void {
        if (page < 1 || page > store.totalPages()) {
          console.warn(`Attempted to go to invalid page: ${page}`);
          return;
        }
        patchState(store, { currentPage: page });
        this.loadBooks({ ...store.currentFilter(), page: page });
      },

      setLimit(limit: number): void {
        patchState(store, { limitPerPage: limit, currentPage: 1 });
        this.loadBooks({ ...store.currentFilter(), limit: limit, page: 1 });
      }
    };
  }),
);