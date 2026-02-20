import { ICard } from './card.interface';

export interface IList {
  id: number;
  title: string;
  position: number;
  cards: ICard[];
}

export interface IListCreate {
  title: string;
  position: number;
}

export interface IListUpdate {
  title?: string;
  position?: number;
}
