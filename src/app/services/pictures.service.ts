import { Injectable, signal } from '@angular/core';
import { Picture } from '../models/picture.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PicturesService {
  private pictures = signal<Picture[]>([]);
  allPictures = this.pictures.asReadonly();

  private readonly baseUrl = 'http://localhost:8080/pictures';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private httpClient: HttpClient) {}

  getPictures(): Observable<Picture[]> {
    console.log('service called');
    return this.httpClient.get<Picture[]>(this.baseUrl, this.httpOptions).pipe(
      timeout(5000),
      tap((pictures) =>
        console.log('Fetched pictures from backend: ', pictures)
      ),
      catchError((error) => {
        console.error('Error fetching pictures: ', error);
        throw error;
      })
    );
  }

  sendPicture(picture: Picture) {
    return this.httpClient
      .post<Picture>(
        'http://localhost:8080/addPicture',
        picture,
        this.httpOptions
      )
      .pipe(catchError(this.handleError('sendData', picture)));
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
