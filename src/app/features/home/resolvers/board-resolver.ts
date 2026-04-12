import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { IBoardSlot } from '@app/shared/interfaces';
import { inject } from '@angular/core';
import { BoardService } from '@app/features/home/services/board.service';

export const BoardResolver: ResolveFn<IBoardSlot | Error> = (route: ActivatedRouteSnapshot) => {
  const boardService = inject(BoardService);
  const id = route.paramMap.get('boardId');
  if (!id || !/^\d+$/.test(id)) {
    throw new Error('Bad id');
  }
  return boardService.getBoardById(+id);
};
