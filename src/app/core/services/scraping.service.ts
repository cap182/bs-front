// src/app/core/services/scraping.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScrapingLog } from '../../shared/models/scraping-log.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScrapingService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getScrapingLogs(): Observable<ScrapingLog[]> {
    const requestUrl = `${this.baseUrl}/scraping/logs`;
    return this.http.get<ScrapingLog[]>(requestUrl);
  }

  /**
   * Envía una solicitud de scraping al backend.
   * @param body Puede contener { page: number } o { category: string } o ser vacío {}.
   * @returns Observable de cualquier tipo, ya que la respuesta podría ser un simple mensaje de éxito.
   */
  postScrapingRequest(body: { page?: number; category?: string } | {}): Observable<any> {
    const requestUrl = `${this.baseUrl}/scraping/books`; // Endpoint para iniciar scraping
    return this.http.post<any>(requestUrl, body);
  }
}