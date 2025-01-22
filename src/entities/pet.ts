export interface Pet {
  id?: string;
  name: string;
  type: string;
  age: number;
  ownerName: string;
}

export interface Analytics {
  totalPets: number;
  typeStatistics: { type: string; count: number }[];
}
