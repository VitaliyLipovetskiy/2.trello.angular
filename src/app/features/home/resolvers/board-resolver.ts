import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { IBoard } from '@app/shared/interfaces';
import { inject } from '@angular/core';
import { BoardService } from '@app/features/home/services/board.service';

export const BoardResolver: ResolveFn<IBoard | Error> = (route: ActivatedRouteSnapshot) => {
  const boardService = inject(BoardService);
  const id = route.paramMap.get('id');
  if (!id || !/^\d+$/.test(id)) {
    console.log('Bad id');
    return new Error('Bad id');
  }
  return boardService.getBoardById(+id);
};
