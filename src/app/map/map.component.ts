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
    }).on(
      'click', (ev) => {
        if (this.marker != null) {
          this.marker.removeFrom(this.map);
        }
        console.log("Clicked on", ev.latlng);
        this.mapClick.emit(ev.latlng);
        this.marker = 
          new L
            .Marker(ev.latlng, {draggable:true})
            .on('dragend', (event) => {
              console.log("Dragged to", event.target.getLatLng())
              this.mapClick.emit(event.target.getLatLng())
            })
            .addTo(this.map);
      }
    );

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 2,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
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
