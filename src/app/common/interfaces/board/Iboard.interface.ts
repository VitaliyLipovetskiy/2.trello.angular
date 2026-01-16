import { IBoardList } from '../list/ilist.interface';

export interface IBoard {
  // id: number,
  title: string;
  custom?: {
    background: string;
  };
  lists: IBoardList[];
}
