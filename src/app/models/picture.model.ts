export interface Picture {
  id: number | null;
  name: string;
  description: string;
  imagePath: string;
  dateTaken: Date | undefined;
  latitude: number;
  longitude: number;
}
