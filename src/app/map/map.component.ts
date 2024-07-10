import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import * as L from 'leaflet';
import { Picture } from '../models/picture.model';

const MAX_ZOOM = 18;
const MIN_ZOOM = 2;

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
  @Output() isAddingPicture = new EventEmitter<boolean>();

  private map: any;
  private marker: L.Marker | null = null;
  
  private initMap(): void {
    this.map = L.map('map', {
      center: [0, 0],
      zoom: 3,
      maxBounds: [[-90, -180], [90, 180]],
      zoomControl: false,
    })
    .fitBounds(this.getPicturesBounds())
    .on('click', (event) => this.addTemporaryMarker(event))
    .on('contextmenu', () => this.removeTemporaryMarker());

    L.control.zoom({
      position: 'bottomleft'
    }).addTo(this.map);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private addTemporaryMarker(event: L.LeafletMouseEvent) {
    console.log("Clicked on", event.latlng);
    this.removeTemporaryMarker();
    this.insertTemporaryMarkerIntoMap(event);
    this.mapClick.emit(event.latlng);
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

  public moveTemporaryMarker(coordinates: L.LatLng) {
    this.marker?.setLatLng(coordinates);
  }

  private removeTemporaryMarker() {
    if (this.marker != null) {
      this.marker.removeFrom(this.map);
    }
    this.isAddingPicture.emit(false);
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

  private getPicturesBounds(): L.LatLngBounds {
    if (this.pictureData.length <= 0) {
      return L.latLngBounds(L.latLng(80, 150), L.latLng(-80, -150));
    }
    let maxLatitude = this.pictureData[0].latitude;
    let minLatitude = maxLatitude;
    let maxLongitude = this.pictureData[0].longitude;
    let minLongitude = maxLongitude;
    for (const picture of this.pictureData) {
      if (picture.latitude > maxLatitude) {
        maxLatitude = picture.latitude;
      }
      if (picture.latitude < minLatitude) {
        minLatitude = picture.latitude;
      }
      if (picture.longitude > maxLongitude) {
        maxLongitude = picture.longitude;
      }
      if (picture.longitude < minLongitude) {
        minLongitude = picture.longitude;
      }
    }
    return L.latLngBounds(
      L.latLng(minLatitude, minLongitude), 
      L.latLng(maxLatitude, maxLongitude));
  }

  ngAfterViewInit() {
    this.initMap();
    this.plotLocations();
  }
}
