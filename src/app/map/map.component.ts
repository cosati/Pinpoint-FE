import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { Picture } from '../models/picture.model';
import { PicturesService } from '../services/pictures.service';
import { MatDialog } from '@angular/material/dialog';
import { PostComponent } from '../post/post.component';

const MAX_ZOOM = 18;
const MIN_ZOOM = 2;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
  @Output() mapClick = new EventEmitter<L.LatLng>();
  @Output() isAddingPicture = new EventEmitter<boolean>();

  pictures: Picture[] = [];
  error: string | null = null;

  private map: any;
  private markers = new Map<number, L.Marker>();
  private temporaryMarker: L.Marker | null = null;

  private postDialog = inject(MatDialog);

  constructor(private picturesService: PicturesService) {}

  private initMap(): void {
    // TODO: Center initially on user's location if no pictures.
    let mapCenter = L.latLng(30, 0);
    let zoom = 3;

    if (this.pictures.length == 1) {
      mapCenter = L.latLng(
        this.pictures[0].latitude,
        this.pictures[0].longitude
      );
      zoom = MAX_ZOOM / 2;
    }

    this.map = L.map('map', {
      center: mapCenter,
      zoom: zoom,
      // TODO: Allow inifinite lateral movement.
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      zoomControl: false,
    })
      .on('click', (event) => this.addTemporaryMarker(event))
      .on('contextmenu', () => this.removeTemporaryMarker());

    if (this.pictures.length > 1) {
      this.map.fitBounds(this.getPicturesBounds());
    }

    L.control
      .zoom({
        position: 'bottomleft',
      })
      .addTo(this.map);

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: MAX_ZOOM,
        minZoom: MIN_ZOOM,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
  }

  private addTemporaryMarker(event: L.LeafletMouseEvent) {
    console.log('Clicked on', event.latlng);
    this.removeTemporaryMarker();
    this.insertTemporaryMarkerIntoMap(event);
    this.mapClick.emit(event.latlng);
  }

  // TODO: Do not insert temporary marker if Popup is open.
  private insertTemporaryMarkerIntoMap(event: L.LeafletMouseEvent) {
    var markerIcon = L.icon({
      iconUrl: 'assets/icons/marker-opaque.png',

      iconSize: [32, 32],
      iconAnchor: [16, 32],
      shadowAnchor: [4, 62],
    });

    this.temporaryMarker = new L.Marker(event.latlng, {
      draggable: true,
      icon: markerIcon,
    })
      .on('drag', (event) => {
        console.log('Dragging to', event.target.getLatLng());
        this.mapClick.emit(event.target.getLatLng());
      })
      .addTo(this.map);
  }

  public moveTemporaryMarker(coordinates: L.LatLng) {
    this.temporaryMarker?.setLatLng(coordinates);
  }

  public removeTemporaryMarker() {
    if (this.temporaryMarker != null) {
      this.temporaryMarker.removeFrom(this.map);
    }
    this.isAddingPicture.emit(false);
  }

  private plotLocations(): void {
    for (const picture of this.pictures) {
      this.plotNewLocation(picture);
    }
  }

  public plotNewLocation(picture: Picture): void {
    var markerIcon = L.icon({
      iconUrl: 'assets/icons/marker.png',

      iconSize: [32, 32],
      iconAnchor: [16, 32],
      shadowAnchor: [4, 62],
    });

    let marker = L.marker([picture.latitude, picture.longitude], {
      icon: markerIcon,
    })
      .bindTooltip(picture.name, { offset: [16, -16] })
      .on('click', () => {
        this.openPostDialog(picture.id);
      })
      .addTo(this.map);
    this.markers.set(picture.id!, marker);
  }

  openPostDialog(pictureId: number | null): void {
    const dialogRef = this.postDialog.open(PostComponent, {
      data: {
        id: pictureId,
      },
    });
    dialogRef.componentInstance.onDeletePicture.subscribe((picture) =>
      this.onPictureDeleted(picture)
    );
  }

  onPictureDeleted(deletedPicture: Picture) {
    let deletedMarker = this.markers.get(deletedPicture.id!);
    this.map.removeLayer(deletedMarker);
  }

  private getPicturesBounds(): L.LatLngBounds {
    let picturesList: Picture[] = this.pictures;
    if (picturesList.length <= 1) {
      return L.latLngBounds(L.latLng(80, 150), L.latLng(-80, -150));
    }
    let maxLatitude = picturesList[0].latitude;
    let minLatitude = maxLatitude;
    let maxLongitude = picturesList[0].longitude;
    let minLongitude = maxLongitude;
    for (const picture of picturesList) {
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
      L.latLng(maxLatitude, maxLongitude)
    );
  }

  ngOnInit() {
    this.picturesService.getPictures().subscribe({
      next: (pictures) => {
        this.pictures = pictures;
        this.initMap();
        this.plotLocations();
      },
      error: (error) => console.log(error),
      complete: () => console.log('Fetched pictures from server.'),
    });
  }
}
