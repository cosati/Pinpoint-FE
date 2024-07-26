import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PicturesService } from '../services/pictures.service';
import { Picture } from '../models/picture.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent {
  @Output() onDeletePicture = new EventEmitter<Picture>();

  picture: Picture | null = null;
  isLoading = true;

  constructor(
    private dialogRef: MatDialogRef<PostComponent>,
    private pictureService: PicturesService,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) {
    console.log(data.id);
    this.pictureService.getPicture(data.id).subscribe({
      next: (picture) => {
        this.picture = picture;
      },
      error: (error) => console.log(error),
      complete: () => (this.isLoading = false),
    });
  }

  onDelete() {
    // TODO: Add confirmation dialog.
    this.pictureService.deletePicture(this.picture?.id!).subscribe({
      next: () => {
        this.onDeletePicture.emit(this.picture!);
        console.log('Post ' + this.picture?.name + ' deleted');
      },
      error: (error) => console.log(error),
      complete: () => this.dialogRef.close(),
    });
  }
}
