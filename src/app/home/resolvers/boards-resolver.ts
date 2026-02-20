import {inject, Injectable} from '@angular/core';
import {Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {IBoards} from '@app/common/interfaces';
import {BoardsService} from '@app/home/services/boards-service';

@Injectable({
  providedIn: 'root',
})
export class BoardsResolver implements Resolve<IBoards> {
  boardService = inject(BoardsService);

  resolve(): Observable<IBoards> {
    return this.boardService.getBoards();
  }
}
