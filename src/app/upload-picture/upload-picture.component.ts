import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Picture } from '../models/picture.model';

@Component({
  selector: 'app-upload-picture',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './upload-picture.component.html',
  styleUrl: './upload-picture.component.scss'
})
export class UploadPictureComponent {
  @Output() add = new EventEmitter<Picture>();
  @ViewChild('inputFile') myInputVariable!: ElementRef;

  status: "initial" | "uploading" | "success" | "fail" = "initial";
  file: File | null = null;
  fileDescription: String = "";

  picture: Picture = {
    name: "",
    description: "",
    id: '',
    path: '',
    date: new Date(),
    latitude: 0,
    longitude: 0
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  onChange(event: any) {
    console.log(event);
    const file: File = event.target.files[0];

    if (file) {
      this.status = "initial";
      this.file = file;
      this.picture.name = file.name;
      this.picture.path = file.name;
    }
  }

  onSubmit() {
    console.log(this.picture);
    this.add.emit(this.picture);
  }

  onCancel() {
    console.log("Clearing up form.");
    this.file = null;
  }

  public setCoordinates(coordinates: L.LatLng) {
    this.picture.latitude = coordinates.lat;
    this.picture.longitude = coordinates.lng;
  }
}
