import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import * as L from 'leaflet';
import { Picture } from '../models/picture.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  @Input() pictureData: Picture[] = [];
  @Output() mapClick = new EventEmitter<L.LatLng>();
  private map: any;
  private marker: L.Marker | null = null;
  
  private initMap(): void {
    this.map = L.map('map', {
      // TODO: Initialize map according to loaded pictures positions.
      center: [ 39.8282, -98.5795 ],
      zoom: 3
    }).on('click', (event) => this.addTemporaryMarker(event)
    ).on('contextmenu', () => this.removeTemporaryMarker());

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 2,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private addTemporaryMarker(event: L.LeafletMouseEvent) {
    console.log("Clicked on", event.latlng);
    this.removeTemporaryMarker();
    this.mapClick.emit(event.latlng);
    this.insertTemporaryMarkerIntoMap(event);
  }

  private insertTemporaryMarkerIntoMap(event: L.LeafletMouseEvent) {
    this.marker =
      new L
        .Marker(event.latlng, { draggable: true })
        .on('drag', (event) => {
          console.log("Dragging to", event.target.getLatLng());
          this.mapClick.emit(event.target.getLatLng());
        })
        .addTo(this.map);
  }

  private removeTemporaryMarker() {
    if (this.marker != null) {
      this.marker.removeFrom(this.map);
    }
  }

  private plotLocations(): void {
    for (const picture of this.pictureData) {
      this.plotNewLocation(picture);
    }
  }

  public plotNewLocation(picture: Picture): void {
    L
      .marker([picture.latitude, picture.longitude])
      .bindTooltip(picture.description)
      .bindPopup("<img src='assets/pictures/" + picture.path + "' width='50' height='50' />")
      .addTo(this.map);
  }

  ngAfterViewInit() {
    this.initMap();
    this.plotLocations();
  }
}
