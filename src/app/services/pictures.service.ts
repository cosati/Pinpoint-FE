import { Injectable, signal } from '@angular/core';
import { Picture } from '../models/picture.model';

@Injectable({
  providedIn: 'root',
})
export class PicturesService {
  private pictures = signal<Picture[]>([]);

  allPictures = this.pictures.asReadonly();

  addPicture(pictureData: Picture) {
    this.pictures.update((oldPictures) => [...oldPictures, pictureData]);
  }

  updatePicture() {}
}
