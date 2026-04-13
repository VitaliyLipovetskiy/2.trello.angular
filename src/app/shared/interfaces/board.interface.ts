import { IList, IListSlot } from './list.interface';

export interface IBoard {
  id: number;
  title: string;
  custom?: {
    background: string;
  };
  lists?: IList[];
}

export interface IBoardSlot {
  id: number;
  title: string;
  custom?: {
    background: string;
  };
  lists?: IListSlot[];
}

export interface IBoardUpdate {
  title: string;
  custom?: {
    background: string;
  };
}
