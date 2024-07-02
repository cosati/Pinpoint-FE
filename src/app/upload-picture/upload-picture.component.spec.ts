import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPictureComponent } from './upload-picture.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { Picture } from '../models/picture.model';
import { latLng } from 'leaflet';

describe('UploadPictureComponent', () => {
  let component: UploadPictureComponent;
  let fixture: ComponentFixture<UploadPictureComponent>;

  let addSpy: jasmine.SpyObj<EventEmitter<Picture>>;

  const picture: Picture = {
    name: "",
    description: "",
    id: '',
    path: '',
    date: new Date(),
    latitude: 0,
    longitude: 0
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPictureComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    addSpy = jasmine.createSpyObj('add', ['emit']);
    component.add = addSpy as EventEmitter<Picture>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the picture on submit', () => {
    component.picture = picture;

    component.onSubmit();

    expect(addSpy.emit).toHaveBeenCalledOnceWith(picture);
  });

  it('should set coordinates to picture', () => {
    component.picture = picture;
    const expectedCoordinates = latLng(30, 39);
    
    component.setCoordinates(expectedCoordinates);

    expect(component.picture.latitude).toBe(expectedCoordinates.lat);
    expect(component.picture.longitude).toBe(expectedCoordinates.lng);
  });
});
