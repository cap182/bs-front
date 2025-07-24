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

// Definimos el tipo de filtro para los libros
export interface BookFilter {
  category_id?: string;
  price?: number;
  price_filter_type?: 'greater_than' | 'less_than' | 'equal';
  page?: number; // Agregamos el número de página
  limit?: number; // Agregamos el límite por página
}

export interface BookState {
  books: Book[];
  categories: Category[];
  isLoading: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  currentFilter: BookFilter;
  totalBooksCount: number; // Nuevo: total de libros según el API
  currentPage: number;     // Nuevo: página actual
  limitPerPage: number;    // Nuevo: límite por página
}

const initialState: BookState = {
  books: [],
  categories: [],
  isLoading: false,
  isLoadingCategories: false,
  error: null,
  currentFilter: {},
  totalBooksCount: 0, // Inicializar en 0
  currentPage: 1,     // Página inicial
  limitPerPage: 30,   // Límite por defecto
};

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // totalBooks: computed(() => store.books().length), // Esto ahora es el total de la página, no el total general
    activeFilter: computed(() => store.currentFilter()),
    totalPages: computed(() => Math.ceil(store.totalBooksCount() / store.limitPerPage())), // Calcular total de páginas
  })),
  withMethods((store) => {
    const bookService = inject(BookService);

    return {
      async loadBooks(filter?: BookFilter): Promise<void> {
        // Combinamos el filtro actual con el nuevo filtro y los parámetros de paginación
        const newFilter = {
          ...store.currentFilter(),
          page: filter?.page ?? store.currentPage(), // Usar la página del filtro si existe, sino la actual del store
          limit: filter?.limit ?? store.limitPerPage(), // Usar el límite del filtro si existe, sino el actual del store
          ...(filter || {}) // Sobreescribir con cualquier otro filtro
        };

        // Evitar recargas si el filtro es idéntico y ya estamos cargando
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
              totalBooksCount: response.total, // Actualizar el total de libros
              currentPage: response.page,       // Actualizar la página actual
              limitPerPage: response.limit,     // Actualizar el límite por página
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

      clearBooks(): void {
        patchState(store, { books: [], isLoading: false, error: null, totalBooksCount: 0, currentPage: 1 });
      },

      // Método para aplicar un filtro sin recargar automáticamente (útil si el filtro se aplica en un formulario)
      setFilter(filter: BookFilter): void {
        patchState(store, { currentFilter: filter });
      },

      // Método para resetear el filtro y la paginación
      resetFilter(): void {
        patchState(store, { currentFilter: {}, currentPage: 1 }); // También resetea la página
        this.loadBooks({}); // Recargar libros sin filtros desde la página 1
      },

      // Método para cambiar la página
      goToPage(page: number): void {
        // No permitir ir a páginas inválidas
        if (page < 1 || page > store.totalPages()) {
          console.warn(`Attempted to go to invalid page: ${page}`);
          return;
        }
        patchState(store, { currentPage: page }); // Actualiza la página en el store
        // Carga los libros con el filtro actual y la nueva página
        this.loadBooks({ ...store.currentFilter(), page: page });
      },

      // Método para cambiar el límite por página (si es necesario desde el UI)
      setLimit(limit: number): void {
        patchState(store, { limitPerPage: limit, currentPage: 1 }); // Resetear a página 1 al cambiar el límite
        this.loadBooks({ ...store.currentFilter(), limit: limit, page: 1 });
      }
    };
  }),
);