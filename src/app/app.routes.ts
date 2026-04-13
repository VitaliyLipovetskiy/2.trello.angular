import { Routes } from '@angular/router';
import { BoardResolver } from '@app/features/home/resolvers/board-resolver';
import { BoardsResolver } from '@app/features/home/resolvers/boards-resolver';
import { Home } from '@app/features/home/components/home/home';
import { Board } from '@app/features/home/components/board/board';
import { CardModal } from '@app/features/home/components/card-modal/card-modal';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    resolve: {
      boards: BoardsResolver,
    },
  },
  {
    path: 'board/:boardId',
    component: Board,
    resolve: {
      board: BoardResolver,
    },
    children: [
      {
        path: 'card/:cardId',
        component: CardModal,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
