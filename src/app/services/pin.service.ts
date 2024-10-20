import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { Pin } from '../models/pin.model';

@Injectable({
  providedIn: 'root',
})
export class PinService {
  private readonly baseUrl = 'http://localhost:8080/pins';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private httpClient: HttpClient) {}

  getPins(): Observable<Pin[]> {
    return this.httpClient
      .get<Pin[]>(this.baseUrl + '/icons', this.httpOptions)
      .pipe(
        tap((pins) => console.log('Fetched pins from backend: ', pins)),
        catchError((error) => {
          console.error('Error fetching pins: ', error);
          throw error;
        })
      );
  }
}
