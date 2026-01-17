import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { IBoard } from '@app/common/interfaces';
import { inject } from '@angular/core';
import { BoardsService } from '@app/home/services/boards-service';

export const BoardResolver: ResolveFn<IBoard> = (route: ActivatedRouteSnapshot) => {
  const boardService = inject(BoardsService);
  return boardService.getBoardById(+(route.paramMap.get('id') || 0));
};
