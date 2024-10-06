import { FileData } from './file-data.model';
import { Geolocation } from './geolocation.model';

export interface Picture {
  id: number | null;
  title: string;
  description: string;
  dateTaken: Date | undefined;
  geolocation: Geolocation;
  fileData: FileData | null;
}
