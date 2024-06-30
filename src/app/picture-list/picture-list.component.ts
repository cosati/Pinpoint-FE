import { Component, Input } from '@angular/core';
import { PictureComponent } from './picture/picture.component';

import { Picture } from '../models/picture.model';

@Component({
  selector: 'app-picture-list',
  standalone: true,
  imports: [PictureComponent],
  templateUrl: './picture-list.component.html',
  styleUrl: './picture-list.component.scss'
})
export class PictureListComponent {
  @Input() pictures: Picture[] = [];
}
