// src/app/core/services/scraping.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs'; // catchError y of pueden ser manejados por el Store ahora, pero está bien mantenerlos aquí si se usan localmente.
import { ScrapingLog } from '../../shared/models/scraping-log.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScrapingService {
  private baseUrl = `${environment.apiUrl}`; // Aseguramos que la base URL sea solo el apiUrl del entorno

  constructor(private http: HttpClient) { }

  getScrapingLogs(): Observable<ScrapingLog[]> {
    const requestUrl = `${this.baseUrl}/scraping/logs`; // Construimos la ruta completa aquí
    return this.http.get<ScrapingLog[]>(requestUrl).pipe(
      // El catchError principal se hará en el store para manejar el estado global de error
      // Pero si quisieras un manejo de error específico de servicio antes de que llegue al store, sería aquí.
      // catchError(error => { /* Manejo de error específico del servicio */ return throwError(() => error); })
    );
  }
}