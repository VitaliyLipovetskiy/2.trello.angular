import { Routes } from '@angular/router';
import { Board, Home } from './home/components/components';
import { BoardResolver } from './home/resolvers/board-resolver';
import { BoardsResolver } from './home/resolvers/boards-resolver';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    resolve: {
      boards: BoardsResolver,
    },
  },
  {
    path: 'board/:id',
    component: Board,
    resolve: {
      board: BoardResolver,
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
