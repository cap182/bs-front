import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Book } from '../../shared/models/book.model';
import { BookService } from '../services/book.service';
import { take } from 'rxjs';

export interface BookState {
  books: Book[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookState = {
  books: [],
  isLoading: false,
  error: null,
};

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Ejemplo de un computed signal
    totalBooks: computed(() => store.books().length),
    // Puedes añadir más computed properties si las necesitas
  })),
  withMethods((store) => {
    const bookService = inject(BookService);

    return {
      async loadBooks(): Promise<void> {
        if (store.isLoading()) return; // Evitar múltiples llamadas simultáneas

        patchState(store, { isLoading: true, error: null });
        try {
          const response = await bookService.getBooks().pipe(take(1)).toPromise();
          if (response) {
            patchState(store, { books: response.data, isLoading: false });
          }
        } catch (error: any) {
          console.error('Error loading books:', error);
          patchState(store, {
            error: error.message || 'Failed to load books',
            isLoading: false,
          });
        }
      },

      clearBooks(): void {
        patchState(store, { books: [], isLoading: false, error: null });
      },
    };
  }),
);