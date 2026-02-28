import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import {
  IBoard,
  IBoardUpdate,
  ICard,
  ICardCreate,
  ICardUpdate,
  IList,
  IListCreate,
  IListUpdate,
  IResult,
  IResultCreated,
} from '@app/shared/interfaces';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly http = inject(HttpClient);
  private readonly toastr = inject(ToastrService);
  private readonly _boards = signal<IBoard[]>([]);
  private readonly _board = signal<IBoard | undefined>(undefined);
  private readonly _list = signal<IList | undefined>(undefined);
  private readonly _card = signal<ICard | undefined>(undefined);
  private readonly _cardUpdatedId = signal<number>(0);
  private readonly _listUpdatedId = signal<number>(0);
  private readonly _cardModal = signal(false);
  readonly boards = this._boards;
  readonly board = this._board.asReadonly();
  readonly list = this._list.asReadonly();
  readonly card = this._card.asReadonly();
  readonly cardUpdatedId = this._cardUpdatedId.asReadonly();
  readonly listUpdatedId = this._listUpdatedId.asReadonly();
  readonly cardModal = this._cardModal.asReadonly();

  getBoards(): Observable<IBoard[]> {
    return this.http.get<{ boards: IBoard[] }>('board').pipe(
      map((response: { boards: IBoard[] }) => response.boards),
      tap((boards) => this._boards.set(boards)),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`board/${id}`).pipe(
      tap((board) => {
        this._board.set({ ...board, id });
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  createBoard(title: string): Observable<IResultCreated> {
    return this.http.post<IResultCreated>('board', { title }).pipe(
      tap(({ result, id }) => {
        if (result === 'Created') {
          this._boards.update((items) => [...items, { id, title }]);
          this.toastr.success('Board created successfully!', 'Success!');
        } else {
          this.toastr.error('Board not created!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  updateBoard(id: number, data: IBoardUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${id}`, data).pipe(
      tap(({ result }) => {
        if (result === 'Updated') {
          const _board = this.board();
          if (!_board) return;
          const board: IBoard = { ..._board, title: data.title };
          if (data.custom) {
            board.custom = data.custom;
          }
          this._board.set(board);
          this.toastr.success('Board updated successfully!', 'Success!');
        } else {
          this.toastr.error('Board not updated!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  removeBoardById(id: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${id}`).pipe(
      tap(({ result }) => {
        if (result === 'Deleted') {
          this._boards.update((items) => items?.filter((board) => board.id !== id));
          this.toastr.success('Board removed successfully!', 'Success!');
        } else {
          this.toastr.error('Board not removed!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  createList(boardId: number, data: IListCreate): Observable<IResultCreated> {
    return this.http.post<IResultCreated>(`board/${boardId}/list`, data).pipe(
      tap(({ result, id }) => {
        if (result === 'Created') {
          const _board = this.board();
          if (!_board) return;
          const list: IList = { id, title: data.title, position: data.position, cards: [] };
          const board: IBoard = { ..._board };
          board.lists?.push(list);
          this._board.set(board);
          this.toastr.success('List created successfully!', 'Success!');
        } else {
          this.toastr.error('List not created!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  updateListById(boardId: number, listId: number, data: IListUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${boardId}/list/${listId}`, data).pipe(
      tap(({ result }) => {
        if (result === 'Updated') {
          const _board = this.board();
          if (!_board) return;
          const lists = this.board()?.lists?.map((list) =>
            list.id === listId ? { ...list, title: data.title } : list,
          ) as IList[];
          this._list.set(lists.find((list) => list.id === listId));
          this._listUpdatedId.set(listId);
          this._board.set({ ..._board, lists });
          this.toastr.success('List updated successfully!', 'Success!');
        } else {
          this.toastr.error('List not updated!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  removeListById(boardId: number, listId: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${boardId}/list/${listId}`).pipe(
      tap(({ result }) => {
        if (result === 'Deleted') {
          const lists = this.board()?.lists?.filter((list) => list.id !== listId) || [];
          this.board()?.lists?.splice(0, this.board()?.lists?.length);
          this.board()?.lists?.push(...lists);
          this.toastr.success('List deleted successfully!', 'Success!');
        } else {
          this.toastr.error('List not deleted!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  getCardById(boardId: number, cardId: number) {
    return this.http.get<IBoard>(`board/${boardId}`).pipe(
      map((board) => {
        this._board.set({ ...board, id: boardId });
        const list = board.lists?.find((l) => l.cards?.some((c) => c.id === cardId));
        this._list.set(list);
        const card = list?.cards.find((c) => c.id === cardId);
        this._card.set(card);
        return card;
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  createCard(boardId: number, data: ICardCreate): Observable<IResultCreated> {
    return this.http.post<IResultCreated>(`board/${boardId}/card`, data).pipe(
      tap(({ result, id }) => {
        if (result === 'Created') {
          this.board()?.lists?.forEach((list) => {
            if (list.id === data.list_id) {
              const card: ICard = { id, title: data.title, position: data.position, users: [] };
              list.cards.push(card);
            }
          });
          this.toastr.success('Card created successfully!', 'Success!');
        } else {
          this.toastr.error('Card not created!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  updateCardById(boardId: number, cardId: number, data: ICardUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${boardId}/card/${cardId}`, data).pipe(
      tap(({ result }) => {
        if (result === 'Updated') {
          this.board()?.lists?.forEach((list) => {
            if (list.id !== data.list_id) return;
            list.cards.forEach((card) => {
              if (card.id !== cardId) return;
              card.title = data.title.trim();
              card.description = data.description?.trim();
              this._cardUpdatedId.set(cardId);
            });
          });
          this.toastr.success('Card updated successfully!', 'Success!');
        } else {
          this.toastr.error('Card not updated!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  removeCardById(boardId: number, cardId: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${boardId}/card/${cardId}`).pipe(
      tap(({ result }) => {
        if (result === 'Deleted') {
          this.board()?.lists?.forEach((list) => {
            if (!list.cards.some((card) => card.id)) return;
            list.cards = list.cards.filter((card) => card.id !== cardId);
          });
          this.toastr.success('Card removed successfully!', 'Success!');
        } else {
          this.toastr.error('Card not deleted!', 'Error!');
        }
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  setCard(card: ICard | undefined, list: IList | undefined) {
    this._card.set(card);
    this._list.set(list);
  }

  clearCardUpdatedId() {
    this._cardUpdatedId.set(0);
  }

  clearListUpdatedId() {
    this._listUpdatedId.set(0);
  }

  setCardModal(cardModal: boolean) {
    this._cardModal.set(cardModal);
  }
}
