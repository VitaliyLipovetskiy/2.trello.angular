import {Routes} from '@angular/router';
import {BoardResolver} from '@app/home/resolvers/board-resolver';
import {BoardsResolver} from '@app/home/resolvers/boards-resolver';
import {Home} from '@app/home/components/home/home';
import {Board} from '@app/home/components/board/board';

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
