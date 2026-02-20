import { IList } from './list.interface';

export interface IBoards {
  boards: IBoard[];
}

export interface IBoard {
  id: number;
  title: string;
  custom?: {
    background: string;
  };
  lists?: IList[];
}

export interface IBoardUpdate {
  title: string;
  custom?: {
    background: string;
  };
}
