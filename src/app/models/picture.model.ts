export interface Picture {
  id: number | null;
  name: string;
  description: string;
  imageData: string;
  dateTaken: Date | undefined;
  latitude: number;
  longitude: number;
}
