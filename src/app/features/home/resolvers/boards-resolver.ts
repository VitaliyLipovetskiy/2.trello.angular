import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { IBoard } from '@app/shared/interfaces';
import { BoardService } from '@app/features/home/services/board.service';

@Injectable({
  providedIn: 'root',
})
export class BoardsResolver implements Resolve<IBoard[]> {
  boardService = inject(BoardService);

  resolve(): Observable<IBoard[]> {
    return this.boardService.getBoards();
  }
}
