import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PicturesService } from '../services/pictures.service';
import { Picture } from '../models/picture.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent {
  picture: Picture | null = null;
  isLoading = true;

  constructor(
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
}
