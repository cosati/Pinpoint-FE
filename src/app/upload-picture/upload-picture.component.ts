import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { type Picture } from '../models/picture.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-picture',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './upload-picture.component.html',
  styleUrl: './upload-picture.component.scss'
})
export class UploadPictureComponent {
  @Output() add = new EventEmitter<Picture>();
  @ViewChild('inputFile') myInputVariable!: ElementRef;

  file: File | null = null;

  private readonly numberValidator = Validators.pattern(/^-?\d+$/);

  pictureForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required]),
    path: new FormControl('', [Validators.required]),
    date: new FormControl(undefined, [Validators.required]),
    latitude: new FormControl(0, [Validators.required, this.numberValidator]),
    longitude: new FormControl(0, [Validators.required, this.numberValidator]),
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  onChange(event: any) {
    console.log(event);
    const file: File = event.target.files[0];

    if (file) {
      this.file = file;
      this.pictureForm.controls['title'].setValue(file.name);
      this.pictureForm.controls['path'].setValue(file.name);
    }
  }

  onSubmit() {
    const picture: Picture = {
      id: '0',
      name: this.pictureForm.controls['title'].value!,
      description: this.pictureForm.controls['description'].value!,
      path: this.pictureForm.controls['path'].value!,
      date: this.pictureForm.controls['date'].value!,
      latitude: this.pictureForm.controls['latitude'].value!,
      longitude: this.pictureForm.controls['longitude'].value!,
    }
    this.add.emit(picture);
  }

  onCancel() {
    console.log("Clearing up form.");
    this.file = null;
    this.pictureForm.controls['title'].setValue("");
    this.pictureForm.controls['description'].setValue("");
    this.pictureForm.controls['path'].setValue("");
    this.pictureForm.controls['date'].setValue(undefined);
    this.pictureForm.controls['latitude'].setValue(0);
    this.pictureForm.controls['longitude'].setValue(0);
    // TODO: remove temporary marker.
  }

  public setCoordinates(coordinates: L.LatLng) {
    this.pictureForm.controls['latitude'].setValue(coordinates.lat);
    this.pictureForm.controls['longitude'].setValue(coordinates.lng);
  }

  isInputValid(): boolean {
    return this.pictureForm.controls['title'].invalid 
      && (this.pictureForm.controls['title'].dirty 
        || this.pictureForm.controls['title'].touched)
  }
}
