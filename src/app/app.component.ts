import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadPictureComponent } from './upload-picture/upload-picture.component';
import { PictureListComponent } from './picture-list/picture-list.component';
import { MapComponent } from './map/map.component';
import { DUMMY_IMAGES } from './dummy-images';
import { type Picture } from './models/picture.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    UploadPictureComponent, 
    PictureListComponent,
    MapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(UploadPictureComponent) uploadComponent!: UploadPictureComponent;
  pictures: Picture[] = DUMMY_IMAGES;

  onAddPicture(newPicture: Picture) {
    console.log("Adding new Picture: " + newPicture.name);
    this.pictures.push(newPicture);
    this.mapComponent.plotNewLocation(newPicture);
  }

  onMapClick(coordinates: L.LatLng) {
    this.uploadComponent.setCoordinates(coordinates);
  }
}
