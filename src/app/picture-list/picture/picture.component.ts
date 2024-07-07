import { Input, Component } from '@angular/core';
import { Picture } from '../../models/picture.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-picture',
  standalone: true,
  imports: [],
  templateUrl: './picture.component.html',
  styleUrl: './picture.component.scss'
})
export class PictureComponent {
  @Input() pictureData: Picture | undefined = undefined;

  datePipe = new DatePipe('en-US');

  constructor() {}

  getFormattedDate(date: Date | undefined) {
    if (date == undefined) date = new Date();
    return this.datePipe.transform(date, 'shortDate');
  }
}
