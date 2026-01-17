import { Routes } from '@angular/router';
import { Board, Home } from './home/components/components';
import { boardResolver } from './home/resolvers/board-resolver';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'board/:id',
    component: Board,
    resolve: { board: boardResolver },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
