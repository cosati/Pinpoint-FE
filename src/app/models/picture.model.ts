import { Geolocation } from './geolocation.model';

export interface Picture {
  id: number | null;
  name: string;
  description: string;
  imageData: string;
  dateTaken: Date | undefined;
  geolocation: Geolocation;
}
