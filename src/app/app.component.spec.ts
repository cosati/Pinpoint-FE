import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UploadPictureComponent } from './upload-picture/upload-picture.component';
import { LatLng, latLng } from 'leaflet';
import { MapComponent } from './map/map.component';
import { Picture } from './models/picture.model';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let uploadComponentSpy: jasmine.SpyObj<UploadPictureComponent>;
  let mapComponentSpy: jasmine.SpyObj<MapComponent>;

  const uploadedPicture: Picture = {
    name: 'Krakow',
    description: 'Wawel Castle',
    path: 'wawel.jpg',
    date: new Date('2023-07-20'),
    latitude: 50.0647,
    longitude: 19.9478,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    uploadComponentSpy = jasmine.createSpyObj('UploadPictureComponent', [
      'setCoordinates',
    ]);
    component.uploadComponent = uploadComponentSpy as UploadPictureComponent;

    mapComponentSpy = jasmine.createSpyObj('MapComponent', [
      'plotNewLocation',
      'moveTemporaryMarker',
      'removeTemporaryMarker',
    ]);
    component.mapComponent = mapComponentSpy as MapComponent;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call uploadComponent.setCoordinates on map click', () => {
    const clickedCoordinates = latLng(50.056074, 19.951778);

    component.onMapClick(clickedCoordinates);

    expect(uploadComponentSpy.setCoordinates).toHaveBeenCalledOnceWith(
      clickedCoordinates
    );
  });

  it('should call mapComponent.plotNewLocation on add new picture', () => {
    component.onAddPicture(uploadedPicture);

    expect(mapComponentSpy.plotNewLocation).toHaveBeenCalledOnceWith(
      uploadedPicture
    );
  });

  it('should update map with new coordinates', () => {
    const expectedCoordinates = latLng(30, 40);

    component.onInsertNewCoordinate(expectedCoordinates);

    expect(mapComponentSpy.moveTemporaryMarker).toHaveBeenCalledOnceWith(
      expectedCoordinates
    );
  });

  it('should removeTemporaryMarker on MapComponent when onCloseUploadDialog', () => {
    component.onCloseUploadDialog();

    expect(mapComponentSpy.removeTemporaryMarker).toHaveBeenCalledTimes(1);
  });
});
