export interface Picture {
    id: string, 
    name: string,
    description: string;
    path: string;
    date: Date | undefined;
    latitude: number;
    longitude: number;
  }