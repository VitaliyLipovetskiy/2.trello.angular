import { Routes } from '@angular/router';
import { Board } from './home/components/board/board';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'board',
    component: Board,
  },
  // {
  //   path: '**',
  //   loadChildren: () => import('./home/home').then(m => m.Home)
  // },
];
