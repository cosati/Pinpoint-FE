import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
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

@Component({
  selector: 'app-upload-picture',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './upload-picture.component.html',
  styleUrl: './upload-picture.component.scss',
})
export class UploadPictureComponent {
  @Input() initialCoordinates: L.LatLng = L.latLng(0, 0);
  @Output() add = new EventEmitter<Picture>();
  @Output() changedCoordinates = new EventEmitter<L.LatLng>();
  @Output() closeDialog = new EventEmitter<any>();
  @ViewChild('inputFile') myInputVariable!: ElementRef;

  file: File | null = null;
  uploadedImageData = null;

  today = new Date().toJSON().split('T')[0];

  private readonly numberValidator = Validators.pattern(/^-?\d+|$^/);

  pictureForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required]),
    imageData: new FormControl('', [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
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

  constructor(private picturesService: PicturesService) {}

  ngOnInit(): void {
    this.pictureForm.controls['latitude']!.setValue(
      this.initialCoordinates.lat
    );
    this.pictureForm.controls['longitude']!.setValue(
      this.initialCoordinates.lng
    );
  }

  onChange(event: any) {
    console.log(event);
    const file: File = event.target.files[0];
    const reader = new FileReader();
    if (file) {
      this.file = file;
      this.pictureForm.controls['title'].setValue(file.name);
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        this.uploadedImageData = e.target.result;
        this.pictureForm.controls['imageData'].setValue(this.uploadedImageData);
      };
    }
  }

  onSubmit() {
    const picture: Picture = {
      id: null,
      name: this.pictureForm.controls['title'].value!,
      description: this.pictureForm.controls['description'].value!,
      imageData: this.pictureForm.controls['imageData'].value!,
      dateTaken: this.pictureForm.controls['date'].value!,
      latitude: this.pictureForm.controls['latitude'].value!,
      longitude: this.pictureForm.controls['longitude'].value!,
    };
    this.picturesService.sendPicture(picture).subscribe({
      next: (response) => {
        console.log(response);
        this.closeDialog.emit();
        this.add.emit(picture);
      },
      error: (error) => console.log(error),
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
