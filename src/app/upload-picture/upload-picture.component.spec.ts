import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPictureComponent } from './upload-picture.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { Picture } from '../models/picture.model';
import { latLng } from 'leaflet';
import { By } from '@angular/platform-browser';
import { PicturesService } from '../services/pictures.service';

describe('UploadPictureComponent', () => {
  let component: UploadPictureComponent;
  let fixture: ComponentFixture<UploadPictureComponent>;

  let addSpy: jasmine.SpyObj<EventEmitter<Picture>>;
  let emitCoordinatesSpy: jasmine.SpyObj<EventEmitter<L.LatLng>>;
  let emitCloseDialogSpy: jasmine.SpyObj<EventEmitter<any>>;

  let picturesServiceSpy: jasmine.SpyObj<PicturesService>;

  let uploadButton: any;

  const validPicture: Picture = {
    name: 'Zakopane',
    description: 'Morskie Oko',
    path: 'tatry.jpg',
    date: new Date('2024-05-22'),
    latitude: 49.2992,
    longitude: 19.9742,
  };

  const requiredInputs = [
    { controlName: 'title', invalidValue: '', validValue: 'abcd' },
    { controlName: 'description', invalidValue: '', validValue: 'a' },
    { controlName: 'path', invalidValue: '', validValue: 'image.jpg' },
    {
      controlName: 'date',
      invalidValue: undefined,
      validValue: new Date('22/05/1991'),
    },
    { controlName: 'latitude', invalidValue: undefined, validValue: 0 },
    { controlName: 'longitude', invalidValue: undefined, validValue: 0 },
  ];

  beforeEach(async () => {
    picturesServiceSpy = jasmine.createSpyObj('PicturesService', [
      'addPicture',
    ]);

    await TestBed.configureTestingModule({
      imports: [UploadPictureComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: PicturesService, useValue: picturesServiceSpy}],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    uploadButton =
      fixture.debugElement.nativeElement.querySelector('#upload-button');

    addSpy = jasmine.createSpyObj('add', ['emit']);
    component.add = addSpy as EventEmitter<Picture>;

    emitCoordinatesSpy = jasmine.createSpyObj('changedCoordinates', ['emit']);
    component.changedCoordinates = emitCoordinatesSpy as EventEmitter<L.LatLng>;

    emitCloseDialogSpy = jasmine.createSpyObj('closeDialog', ['emit']);
    component.closeDialog = emitCloseDialogSpy as EventEmitter<any>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  requiredInputs.forEach((input) => {
    it(`should set required error on missing ${input.controlName} value`, () => {
      let inputControl = component.pictureForm.get(input.controlName);

      inputControl?.setValue(input.invalidValue);

      expect(inputControl?.valid).toBeFalsy();
      expect(inputControl?.errors!['required']).toBeTruthy();
    });
  });

  requiredInputs.forEach((input) => {
    it(`should not set required error on valid ${input.controlName} value`, () => {
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

  [
    { controlname: 'latitude', invalidValue: 90.0001, inputError: 'max' },
    { controlname: 'latitude', invalidValue: -90.0001, inputError: 'min' },
    { controlname: 'longitude', invalidValue: 180.0001, inputError: 'max' },
    { controlname: 'longitude', invalidValue: -180.0001, inputError: 'min' },
  ].forEach((coordinateInput) => {
    it(`should set invalid ${coordinateInput.inputError} value for ${coordinateInput.controlname}`, () => {
      let inputControl = component.pictureForm.get(coordinateInput.controlname);

      inputControl?.setValue(coordinateInput.invalidValue);

      expect(inputControl?.valid).toBeFalsy();
      expect(inputControl?.errors![coordinateInput.inputError]).toBeTruthy();
    });
  });

  it('should emit the picture on submit', () => {
    insertValuesIntoForm(component, validPicture);
    fixture.detectChanges();

    uploadButton.click();

    expect(addSpy.emit).toHaveBeenCalledOnceWith(validPicture);
  });

  it('should call addPicture on service on submit', () => {
    insertValuesIntoForm(component, validPicture);
    fixture.detectChanges();

    uploadButton.click();

    expect(picturesServiceSpy.addPicture).toHaveBeenCalledOnceWith(validPicture);
  });

  it('should close the dialog after submit', () => {
    insertValuesIntoForm(component, validPicture);
    fixture.detectChanges();

    uploadButton.click();

    expect(emitCloseDialogSpy.emit).toHaveBeenCalledTimes(1);
  });

  it('should set coordinates to form', () => {
    const expectedCoordinates = latLng(30, 39);

    component.setCoordinates(expectedCoordinates);

    expect(component.pictureForm.controls['latitude'].value).toBe(
      expectedCoordinates.lat
    );
    expect(component.pictureForm.controls['longitude'].value).toBe(
      expectedCoordinates.lng
    );
  });

  // TODO: Fix and add for both inputs.
  xit('should emit new coordinates when changing input values', () => {
    const coordinateInput = fixture.debugElement.query(
      By.css('#latitude-input')
    ).nativeElement;

    coordinateInput.value = 3;
    coordinateInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emitCoordinatesSpy.emit).toHaveBeenCalledOnceWith(latLng(50, 0));
  });

  it('should disable upload button if form is invalid', () => {
    const invalidPicture: Picture = {
      ...validPicture,
      path: '',
    };

    let pictureForm = insertValuesIntoForm(component, invalidPicture);
    fixture.detectChanges();

    expect(pictureForm.valid).toBeFalsy();
    expect(uploadButton.disabled).toBeTruthy();
  });

  it('should enable upload button if form is valid', () => {
    let pictureForm = insertValuesIntoForm(component, validPicture);
    fixture.detectChanges();

    expect(pictureForm.valid).toBeTruthy();
    expect(uploadButton.disabled).toBeFalsy();
  });

  it('should emit closeDialog if user clicks on cancel button', () => {
    const cancelButton =
      fixture.debugElement.nativeElement.querySelector('#cancel-button');

    cancelButton.click();

    expect(emitCloseDialogSpy.emit).toHaveBeenCalledTimes(1);
  });
});

function insertValuesIntoForm(
  component: UploadPictureComponent,
  picture: Picture
) {
  const pictureForm = component.pictureForm;
  pictureForm.controls['title'].setValue(picture.name);
  pictureForm.controls['description'].setValue(picture.description);
  pictureForm.controls['path'].setValue(picture.path);
  pictureForm.controls['latitude'].setValue(picture.latitude);
  pictureForm.controls['longitude'].setValue(picture.longitude);
  pictureForm.controls['date'].setValue(picture.date);
  return pictureForm;
}
