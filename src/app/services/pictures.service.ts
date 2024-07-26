import { Injectable, signal } from '@angular/core';
import { Picture } from '../models/picture.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PicturesService {
  private pictures = signal<Picture[]>([]);
  allPictures = this.pictures.asReadonly();

  private readonly baseUrl = 'http://localhost:8080/';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private httpClient: HttpClient) {}

  getPictures(): Observable<Picture[]> {
    return this.httpClient
      .get<Picture[]>(this.baseUrl + 'pictures', this.httpOptions)
      .pipe(
        tap((pictures) =>
          console.log('Fetched pictures from backend: ', pictures)
        ),
        catchError((error) => {
          console.error('Error fetching pictures: ', error);
          throw error;
        })
      );
  }

  getPicture(id: number): Observable<Picture | null> {
    return this.httpClient
      .get<Picture>(this.baseUrl + '/picture/' + id, this.httpOptions)
      .pipe(
        tap((picture) =>
          console.log('Fetched picture from backend: ', picture)
        ),
        catchError((error) => {
          console.error('Error fetching pictures: ', error);
          throw error;
        })
      );
  }

  sendPicture(picture: Picture) {
    return this.httpClient
      .post<Picture>(this.baseUrl + 'addPicture', picture, this.httpOptions)
      .pipe(catchError(this.handleError('sendPicture', picture)));
  }

  addPicture(pictureData: Picture) {
    this.pictures.update((oldPictures) => [...oldPictures, pictureData]);
  }

  updatePicture() {}

  private handleError(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      return throwError(() => new Error(error));
    };
  }
}
