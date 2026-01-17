import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IBoard } from '../../../common/interfaces/board/Iboard.interface';
import { List } from '../list/list';

@Component({
  selector: 'tr-board',
  imports: [List],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Board {
  board: IBoard = {
    title: 'Моя тестовая доска',
    lists: [
      {
        id: 1,
        title: 'Планы',
        cards: [
          { id: 1, title: 'помыть кота' },
          { id: 2, title: 'приготовить суп' },
          { id: 3, title: 'сходить в магазин' },
        ],
      },
      {
        id: 2,
        title: 'В процессе',
        cards: [{ id: 4, title: 'посмотреть сериал' }],
      },
      {
        id: 3,
        title: 'Сделано',
        cards: [
          { id: 5, title: 'сделать домашку' },
          { id: 6, title: 'погулять с собакой' },
        ],
      },
    ],
  };
}
