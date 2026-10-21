export const API_URL = 'https://opensheet.elk.sh/1hZ-NFQ64wi2Z5fdUQJqu2ed5J7ZCpbpPr_L8O3RG6WE/Database';
export const PAGE_SIZE = 60;

export interface Card {
  id: string;
  Game: string;
  Set: string;
  'Card Name': string;
  Grade: string;
  Center: string;
  Edges: string;
  Surface: string;
  Corners: string;
  'Date Graded': string;
}

export interface FilterState {
  query: string;
  language: string;
  sets: string[];
  grade: string;
  sort: string;
}

export const DEFAULT_FILTERS: FilterState = {
  query: '',
  language: '',
  sets: [],
  grade: '',
  sort: 'date-desc',
};
