import { inject, Injectable } from '@angular/core';
import { IBoard } from '@app/common/interfaces';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  http = inject(HttpClient);

  getBoards(): Observable<IBoard[]> {
    return this.http
      .get<{ boards: IBoard[] }>('board')
      .pipe(map((response: { boards: IBoard[] }) => response.boards));
  }

  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`board/${id}`);
  }
}
