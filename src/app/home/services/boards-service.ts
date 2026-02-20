import { inject, Injectable } from '@angular/core';
import {
  IBoard,
  IBoards,
  IBoardUpdate,
  ICardCreate,
  ICardUpdate,
  IListCreate,
  IListUpdate,
  IResult,
  IResultCreated,
} from '@app/common/interfaces';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  http = inject(HttpClient);

  getBoards(): Observable<IBoards> {
    return this.http
      .get<{ boards: IBoards }>('board')
      .pipe(map((response: { boards: IBoards }) => response.boards));
  }

  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`board/${id}`);
  }

  createBoard(title: string): Observable<IResultCreated> {
    return this.http.post<IResultCreated>('board', { title });
  }

  updateBoard(id: number, data: IBoardUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${id}`, data);
  }

  removeBoardById(id: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${id}`);
  }

  createList(boardId: number, data: IListCreate): Observable<IResultCreated> {
    return this.http.post<IResultCreated>(`board/${boardId}/list`, data);
  }

  updateListById(boardId: number, listId: number, data: IListUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${boardId}/list/${listId}`, data);
  }

  removeListById(boardId: number, listId: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${boardId}/list/${listId}`);
  }

  createCard(boardId: number, data: ICardCreate): Observable<IResultCreated> {
    return this.http.post<IResultCreated>(`board/${boardId}/card`, data);
  }

  updateCardById(boardId: number, cardId: number, data: ICardUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${boardId}/card/${cardId}`, data);
  }

  removeCardById(boardId: number, cardId: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${boardId}/card/${cardId}`);
  }
}
