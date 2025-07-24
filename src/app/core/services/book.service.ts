import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BooksApiResponse } from '../../shared/models/book.model';
import { Category } from '../../shared/models/category.model';
import { BookFilter } from '../stores/book.store';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getBooks(filter?: BookFilter): Observable<BooksApiResponse> {
    let params = new HttpParams();

    // Añadir parámetros de filtro
    if (filter) {
      if (filter.category_id) {
        params = params.set('category_id', filter.category_id);
      }
      if (filter.price !== undefined && filter.price !== null) {
        params = params.set('price', filter.price.toString());
      }
      if (filter.price_filter_type) {
        params = params.set('price_filter_type', filter.price_filter_type);
      }
      // Añadir parámetros de paginación
      if (filter.page !== undefined && filter.page !== null) {
        params = params.set('page', filter.page.toString());
      }
      if (filter.limit !== undefined && filter.limit !== null) {
        params = params.set('limit', filter.limit.toString());
      }
    }

    return this.http.get<BooksApiResponse>(`${this.apiUrl}/books`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  deleteBook(bookId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/books/${bookId}`);
  }
}
