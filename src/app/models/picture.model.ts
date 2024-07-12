export interface Picture {
    name: string,
    description: string;
    path: string;
    date: Date | undefined;
    latitude: number;
    longitude: number;
  }