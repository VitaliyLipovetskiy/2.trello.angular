import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { IBoard } from '@app/common/interfaces';
import { BoardsService } from '@app/home/services/boards-service';

@Injectable({
  providedIn: 'root',
})
export class BoardsResolver implements Resolve<IBoard[]> {
  boardService = inject(BoardsService);

  resolve(): Observable<IBoard[]> {
    return this.boardService.getBoards();
  }
}
