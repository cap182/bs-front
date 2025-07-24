// src/app/core/services/book.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BooksApiResponse } from '../../shared/models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:3000'; // Asegúrate de que tu backend esté corriendo en este puerto

  constructor(private http: HttpClient) {}

  getBooks(): Observable<BooksApiResponse> {
    return this.http.get<BooksApiResponse>(`${this.apiUrl}/books`);
  }
}