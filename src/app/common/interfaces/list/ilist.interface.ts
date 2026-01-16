import { ICard } from '../card/icard.interface';

export interface IBoardList {
  id: number;
  title: string;
  // position: number,
  cards: ICard[];
}
