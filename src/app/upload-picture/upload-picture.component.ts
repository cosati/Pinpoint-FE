import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { type Picture } from '../models/picture.model';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { PicturesService } from '../services/pictures.service';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import { Geolocation } from '../models/geolocation.model';
import { Pin } from '../models/pin.model';
import { PinService } from '../services/pin.service';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-upload-picture',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperComponent,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './upload-picture.component.html',
  styleUrl: './upload-picture.component.scss',
})
export class UploadPictureComponent implements OnInit {
  @Input() initialCoordinates: L.LatLng = L.latLng(0, 0);
  @Output() add = new EventEmitter<Picture>();
  @Output() changedCoordinates = new EventEmitter<L.LatLng>();
  @Output() closeDialog = new EventEmitter<any>();
  @ViewChild('inputFile') myInputVariable!: ElementRef;

  croppedImage: any = '';
  imageChangedEvent: Event | null = null;

  today = new Date().toJSON().split('T')[0];

  pins: Pin[] = [];

  private readonly numberValidator = Validators.pattern(/^-?\d+|$^/);

  pictureForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    pin: new FormControl,
    latitude: new FormControl(0, [
      Validators.required,
      this.numberValidator,
      this.coordinateRangeValidator(-90, 90),
    ]),
    longitude: new FormControl(0, [
      Validators.required,
      this.numberValidator,
      this.coordinateRangeValidator(-180, 180),
    ]),
  });

  constructor(
    private picturesService: PicturesService,
    private pinService: PinService
  ) {}

  ngOnInit(): void {
    this.pictureForm.controls['latitude']!.setValue(
      this.initialCoordinates.lat
    );
    this.pictureForm.controls['longitude']!.setValue(
      this.initialCoordinates.lng
    );

    this.pinService.getPins().subscribe({
      next: (pins) => {
        this.pins = pins;
      },
      error: (error) => console.log(error),
      complete: () => console.log('Fetched pins from server.'),
    });
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
  }

  cropperReady() {}

  imageLoaded(image: LoadedImage) {
    // show cropper
  }

  loadImageFailed() {
    // TODO: Display error on UI.
    console.log('Error uploading image!');
  }

  onChange(event: any) {
    console.log(event);
    this.imageChangedEvent = event;
  }

  onSubmit() {
    const geolocation: Geolocation = {
      id: null,
      latitude: this.pictureForm.controls['latitude'].value!,
      longitude: this.pictureForm.controls['longitude'].value!,
    };
    const picture: Picture = {
      id: null,
      title: this.pictureForm.controls['title'].value!,
      pin: this.pictureForm.controls['pin'].value,
      description: this.pictureForm.controls['description'].value!,
      dateTaken: this.pictureForm.controls['date'].value!,
      geolocation: geolocation,
      fileData: null,
    };
    this.picturesService.sendPicture(picture, this.croppedImage).subscribe({
      next: (response) => {
        console.log(response);
        this.closeDialog.emit();
        this.add.emit(response);
      },
      error: (error) => console.log('Error uploading picture: ', error),
      complete: () => console.log('Picture added.'),
    });
  }

  onCancel() {
    this.closeDialog.emit();
  }

  public setCoordinates(coordinates: L.LatLng) {
    this.pictureForm.controls['latitude']!.setValue(coordinates.lat);
    this.pictureForm.controls['longitude']!.setValue(coordinates.lng);
  }

  onChangeCoordinates() {
    console.log(
      'Setting coordinates thorugh input to ' +
        L.latLng(
          this.pictureForm.controls['latitude']!.value!,
          this.pictureForm.controls['longitude']!.value!
        )
    );
    this.changedCoordinates.emit(
      L.latLng(
        this.pictureForm.controls['latitude']!.value!,
        this.pictureForm.controls['longitude']!.value!
      )
    );
  }

  isInputInvalid<T extends FormControl>(control: T): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  coordinateRangeValidator(min: number, max: number) {
    return (control: FormControl): ValidationErrors | null => {
      if (control.value && (control.value < min || control.value > max)) {
        return { range: `Coordinate must be between ${min} and ${max}` };
      }
      return null;
    };
  }
}
