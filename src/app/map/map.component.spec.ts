import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';
import { PicturesService } from '../services/pictures.service';
import { of } from 'rxjs';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  let picturesServiceSpy: jasmine.SpyObj<PicturesService>;

  beforeEach(async () => {
    picturesServiceSpy = jasmine.createSpyObj('PicturesService', [
      'getPictures',
    ]);

    picturesServiceSpy.getPictures.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [{ provide: PicturesService, useValue: picturesServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
