import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadPictureComponent } from './upload-picture/upload-picture.component';
import { MapComponent } from './map/map.component';
import { type Picture } from './models/picture.model';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UploadPictureComponent, MapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(UploadPictureComponent) uploadComponent!: UploadPictureComponent;

  shouldDisplayUploadDialog = false;
  clickedCoordinates = L.latLng(0, 0);

  onAddPicture(newPicture: Picture) {
    console.log('Adding new Picture: ' + newPicture.name);
    this.mapComponent.plotNewLocation(newPicture);
  }

  onInsertNewCoordinate(coordinates: L.LatLng) {
    this.mapComponent.moveTemporaryMarker(coordinates);
  }

  onMapClick(coordinates: L.LatLng) {
    this.shouldDisplayUploadDialog = true;
    this.clickedCoordinates = coordinates;
    if (this.uploadComponent) {
      this.uploadComponent.setCoordinates(coordinates);
    }
  }

  onAddingPicture(isAddingPicture: boolean) {
    this.shouldDisplayUploadDialog = isAddingPicture;
  }

  onCloseUploadDialog() {
    this.mapComponent.removeTemporaryMarker();
  }
}
