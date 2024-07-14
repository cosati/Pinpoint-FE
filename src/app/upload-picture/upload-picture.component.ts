import { HttpClient } from '@angular/common/http';
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

  private readonly numberValidator = Validators.pattern(/^-?\d+|$^/);

  pictureForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required]),
    path: new FormControl('', [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    latitude: new FormControl(0, [Validators.required, this.numberValidator]),
    longitude: new FormControl(0, [Validators.required, this.numberValidator]),
  });

  constructor(
    private http: HttpClient,
    private picturesService: PicturesService
  ) {}

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

    if (file) {
      this.file = file;
      this.pictureForm.controls['title'].setValue(file.name);
      this.pictureForm.controls['path'].setValue(file.name);
    }
  }

  onSubmit() {
    const picture: Picture = {
      id: null,
      name: this.pictureForm.controls['title'].value!,
      description: this.pictureForm.controls['description'].value!,
      imagePath: this.pictureForm.controls['path'].value!,
      dateTaken: this.pictureForm.controls['date'].value!,
      latitude: this.pictureForm.controls['latitude'].value!,
      longitude: this.pictureForm.controls['longitude'].value!,
    };
    this.picturesService.addPicture(picture);
    this.closeDialog.emit();
    this.add.emit(picture);
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

  isInputValid(): boolean {
    return (
      this.pictureForm.controls['title'].invalid &&
      (this.pictureForm.controls['title'].dirty ||
        this.pictureForm.controls['title'].touched)
    );
  }
}
