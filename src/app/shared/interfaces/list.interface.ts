import { ICard, ICardSlot } from './card.interface';

export interface IList {
  id: number;
  title: string;
  position: number;
  cards: ICard[];
}

export interface IListSlot {
  id: number;
  title: string;
  position: number;
  cardSlots: ICardSlot[];
}

export interface IListCreate {
  title: string;
  position: number;
}

export interface IListUpdate {
  title?: string;
  position?: number;
}

export interface IListsUpdate {
  id: number;
  position: number;
}
