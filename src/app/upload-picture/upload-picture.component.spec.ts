import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPictureComponent } from './upload-picture.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { Picture } from '../models/picture.model';

describe('UploadPictureComponent', () => {
  let component: UploadPictureComponent;
  let fixture: ComponentFixture<UploadPictureComponent>;

  let addSpy: jasmine.SpyObj<EventEmitter<Picture>>;

  const pristinePicture: Picture = {
    name: "",
    description: "",
    id: '',
    path: '',
    date: undefined,
    latitude: 0,
    longitude: 0
  }

  const picture: Picture = {
    id: '4',
    name: 'Zakopane',
    description: 'Morskie Oko',
    path: 'tatry.jpg',
    date: new Date('2024-05-22'),
    latitude: 49.2992,
    longitude: 19.9742,
  }

  const requiredInputs = [
    { controlName: 'title', invalidValue: '', validValue: 'abcd' },
    { controlName: 'description', invalidValue: '', validValue: 'a' },
    { controlName: 'path', invalidValue: '', validValue: 'image.jpg' },
    { controlName: 'date', invalidValue: undefined, validValue: new Date('22/05/1991') },
    { controlName: 'latitude', invalidValue: undefined, validValue: 0 },
    { controlName: 'longitude', invalidValue: undefined, validValue: 0 },
  ];

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

  requiredInputs.forEach((input) => {
    it(`should set required error on missing ${ input.controlName } value`, () => {
      let inputControl = component.pictureForm.get(input.controlName);

      inputControl?.setValue(input.invalidValue);

      expect(inputControl?.valid).toBeFalsy();
      expect(inputControl?.errors!['required']).toBeTruthy();
    });
  });

  requiredInputs.forEach((input) => {
    it(`should not set required error on valid ${ input.controlName } value`, () => {
      let inputControl = component.pictureForm.get(input.controlName);

      inputControl?.setValue(input.validValue);

      expect(inputControl?.valid).toBeTruthy();
    });
  });

  it('should require minimum length of 4 for title input', () => {
    let titleInput = component.pictureForm.controls['title'];

    titleInput.setValue('abc');

    expect(titleInput.valid).toBeFalsy();
    expect(titleInput.errors!['minlength']).toBeTruthy();
  });

  // it('should set coordinates to picture', () => {
  //   const input = fixture.nativeElement.querySelector('title');
  //   const event = createNewEvent('input');
    
    
  //   component.picture = picture;
  //   const expectedCoordinates = latLng(30, 39);
    
  //   component.setCoordinates(expectedCoordinates);

  //   expect(component.pictureForm.controls['latitude'].value)
  //     .toBe(expectedCoordinates.lat);
  //   expect(component.pictureForm.controls['longitude'].value)
  //     .toBe(expectedCoordinates.lng);
  // });

  // it('should clear picture data on cancel', () => {
  //   component.pictureForm.controls['title'] = picture;

  //   component.onCancel();

  //   expect(component.picture).toEqual(pristinePicture);
  // });
});
