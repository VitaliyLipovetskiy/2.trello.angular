import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { IBoard } from '@app/shared/interfaces';
import { BoardService } from '@app/features/home/services/board.service';

export const BoardsResolver: ResolveFn<IBoard[]> = () => {
  const boardService = inject(BoardService);
  return boardService.getBoards();
};
