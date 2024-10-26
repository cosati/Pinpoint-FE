import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PicturesService } from '../services/pictures.service';
import { Picture } from '../models/picture.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Pin } from '../models/pin.model';
import { PinService } from '../services/pin.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-post',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
  @Output() onDeletePicture = new EventEmitter<Picture>();

  picture: Picture | null = null;

  private readonly numberValidator = Validators.pattern(/^-?\d+|$^/);

  pictureForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    pin: new FormControl(),
  });

  pins: Pin[] = [];

  today = new Date().toJSON().split('T')[0];

  isLoading = true;
  isEditing = false;

  constructor(
    private dialogRef: MatDialogRef<PostComponent>,
    private pictureService: PicturesService,
    private pinService: PinService,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) {
    console.log(data.id);
    this.pictureService.getPicture(data.id).subscribe({
      next: (picture) => {
        this.picture = picture;
        this.pictureForm.controls['title'].setValue(picture!.title);
        this.pictureForm.controls['description'].setValue(picture!.description);
        this.pictureForm.controls['date'].setValue(picture!.dateTaken);
        this.pictureForm.controls['pin'].setValue(picture!.pin?.color);
      },
      error: (error) => console.log(error),
      complete: () => (this.isLoading = false),
    });
  }
  ngOnInit(): void {
    this.pinService.getPins().subscribe({
      next: (pins) => {
        this.pins = pins;
      },
      error: (error) => console.log(error),
      complete: () => console.log('Fetched pins from server.'),
    });
  }

  onDelete() {
    // TODO: Add confirmation dialog.
    this.pictureService.deletePicture(this.picture?.id!).subscribe({
      next: () => {
        this.onDeletePicture.emit(this.picture!);
        console.log('Post ' + this.picture?.title + ' deleted');
      },
      error: (error) => console.log(error),
      complete: () => this.dialogRef.close(),
    });
  }

  onEdit() {
    this.isEditing = true;
  }

  onCancelEdit() {
    this.isEditing = false;
  }

  onClose() {
    this.dialogRef.close();
  }

  onSave() {
    const selectedPin =
      this.pictureForm.controls['pin'].value != undefined
        ? this.pins.find(
            (pin) => pin.color === this.pictureForm.controls['pin'].value!
          )
        : null;

    const updatedPicture = {
      ...this.picture!,
      title: this.pictureForm.controls['title'].value!,
      pin: selectedPin,
      description: this.pictureForm.controls['description'].value!,
      dateTaken: this.pictureForm.controls['date'].value!,
    };
    this.pictureService.updatePicture(updatedPicture).subscribe({
      next: (response) => {
        console.log('Picture updated.');
        this.picture = response;
        this.isEditing = false;
      },
      error: (error) => console.log('Error updating picture: ', error),
      complete: () => console.log('Picture updated.'),
    });
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
