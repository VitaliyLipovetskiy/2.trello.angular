import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import {
  IBoard,
  IBoardSlot,
  IBoardUpdate,
  ICard,
  ICardCreate,
  ICardSlot,
  ICardsUpdate,
  ICardUpdate,
  IList,
  IListCreate,
  IListSlot,
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
  private readonly _board = signal<IBoardSlot | undefined>(undefined);
  private readonly _list = signal<IListSlot | undefined>(undefined);
  private readonly _card = signal<ICardSlot | undefined>(undefined);
  private readonly _cardUpdatedId = signal<number>(0);
  private readonly _listUpdatedId = signal<number>(0);
  private readonly _cardModal = signal(false);
  private readonly _cardDragged = signal<ICardSlot | undefined>(undefined);
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

  getBoardById(id: number): Observable<IBoardSlot> {
    return this.http.get<IBoard>(`board/${id}`).pipe(
      map((board) => {
        const lists = board.lists?.map((list) => this.convertListToSlot(list));
        const boardSlot: IBoardSlot = { ...board, id, lists };
        this._board.set(boardSlot);
        return boardSlot;
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
          const board: IBoardSlot = { ..._board, title: data.title };
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
          const board: IBoardSlot = { ..._board };
          board.lists?.push(this.convertListToSlot(list));
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
          const listSlots: IListSlot[] =
            this.board()?.lists?.map((listSlot) =>
              listSlot.id === listId ? ({ ...listSlot, title: data.title } as IListSlot) : listSlot,
            ) || [];
          this._list.set(listSlots.find((listSlot) => listSlot.id === listId));
          this._listUpdatedId.set(listId);
          this._board.set({ ..._board, lists: listSlots });
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
          const listSlots = this.board()?.lists?.filter((listSlot) => listSlot.id !== listId) || [];
          this.board()?.lists?.splice(0, this.board()?.lists?.length);
          this.board()?.lists?.push(...listSlots);
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
        const listSlots = board.lists?.map((list) => this.convertListToSlot(list)) || [];
        const boardSlot: IBoardSlot = { ...board, id: boardId, lists: listSlots };
        this._board.set(boardSlot);
        const listSlot = listSlots.find((l) => l.cardSlots.some((c) => c.card?.id === cardId));
        this._list.set(listSlot);
        const card = listSlot?.cardSlots.find((c) => c.card?.id === cardId);
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
          this.board()?.lists?.forEach((listSlot) => {
            if (listSlot.id === data.list_id) {
              const card: ICard = { id, title: data.title, position: data.position, users: [] };
              const cardSlot: ICardSlot = { position: data.position, card, view: true };
              listSlot.cardSlots.push(cardSlot);
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
          this.board()?.lists?.forEach((listSlot) => {
            if (listSlot.id !== data.list_id) return;
            listSlot.cardSlots.forEach((cardSlot) => {
              if (cardSlot.card?.id !== cardId) return;
              cardSlot.card.title = data.title.trim();
              cardSlot.card.description = data.description?.trim();
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

  updateGroupCards(boardId: number, data: ICardsUpdate[]): Observable<IResult> {
    return this.http.put<IResult>(`board/${boardId}/card`, data).pipe(
      tap(({ result }) => {
        if (result !== 'Updated') {
          this.toastr.error('Card not updated!', 'Error!');
          return;
        }
        this.getBoardById(boardId).subscribe();
        this.toastr.success('Cards updated successfully!', 'Success!');
      }),
      catchError((error) => {
        console.log(error);
        this.toastr.error(error.message, 'Error!');
        return of();
      }),
    );
  }

  removeCardById(boardId: number, listId: number, cardId: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${boardId}/card/${cardId}`).pipe(
      tap(({ result }) => {
        if (result === 'Deleted') {
          this.board()?.lists?.forEach((listSlot) => {
            if (!listSlot.cardSlots.some((cardSlot) => cardSlot.card?.id)) return;
            listSlot.cardSlots = listSlot.cardSlots.filter(
              (cardSlot) => cardSlot.card?.id !== +cardId,
            );
          });
          this._listUpdatedId.set(listId);
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

  setCard(cardSlot: ICardSlot | undefined, listSlot: IListSlot | undefined) {
    this._card.set(cardSlot);
    this._list.set(listSlot);
  }

  clearCardUpdatedId() {
    this._cardUpdatedId.set(0);
  }

  clearListUpdatedId() {
    this._listUpdatedId.set(0);
  }

  setCardModal(cardModal: boolean) {
    this._cardModal.set(cardModal);
    this._card.set(undefined);
  }

  showPlaceholderSlot(position: number, listSlot: IListSlot) {
    const cardDragged = this._cardDragged();

    const sourceList = this.board()?.lists?.find((l) =>
      l.cardSlots.some((s) => s.card?.id === cardDragged?.card?.id),
    );

    if (cardDragged?.card && listSlot.id === sourceList?.id) {
      const currentPos = cardDragged.card.position;
      if (position === currentPos || position === currentPos + 1) {
        if (listSlot.cardSlots.some((s) => !s.card && s.view)) {
          this.hidePlaceholderSlot(listSlot);
        }
        return;
      }
    }

    const currentPlaceholder = listSlot.cardSlots.find((s) => !s.card);
    if (currentPlaceholder?.view && currentPlaceholder.position === position) {
      return;
    }

    const cards = listSlot.cardSlots
      .filter((s) => !!s.card)
      .map((s) => s.card!)
      .sort((a, b) => a.position - b.position);

    const newCardSlots: ICardSlot[] = cards.map((card) => {
      const shouldShift = card.position >= position;
      return {
        card,
        view: true,
        position: card.position + (shouldShift ? 1 : 0),
      };
    });

    newCardSlots.push({
      card: undefined,
      view: true,
      position: position,
    });
    newCardSlots.sort((a, b) => a.position - b.position);
    const newList = { ...listSlot, cardSlots: newCardSlots };

    this._board.update((board) => {
      if (!board) return board;
      return {
        ...board,
        lists: board.lists?.map((l) => (l.id === listSlot.id ? newList : l)),
      };
    });
  }

  hidePlaceholderSlot(listSlot: IListSlot) {
    const cardSlots = listSlot.cardSlots
      .map((cardSlot) => ({
        ...cardSlot,
        view: !!cardSlot.card,
        position: cardSlot.card?.position || 0,
      }))
      .sort((a, b) => a.position - b.position);
    this._list.set({ ...listSlot, cardSlots });

    const _board = this.board();
    const _list = this.list();
    if (!_board || !_list) return;
    const listSlots: IListSlot[] =
      this.board()?.lists?.map((list) => (list.id === _list.id ? _list : list)) || [];
    this._board.set({ ..._board, lists: listSlots });
  }

  setCardDragged(cardId: string | undefined, listId: number | undefined) {
    if (cardId && listId) {
      const cardDragged = this.board()
        ?.lists?.find((list) => list.id === listId)
        ?.cardSlots?.find((card) => card.card?.id === +cardId);
      this._cardDragged.set(cardDragged);
    } else {
      this._cardDragged.set(undefined);
    }
  }

  hideCardDragged() {
    const cardDragged = this._cardDragged();
    if (cardDragged) {
      this._cardDragged.set({ ...cardDragged, view: false });
    }
  }

  private convertListToSlot(list: IList): IListSlot {
    const cardSlots = [...list.cards, undefined]
      .map((card) => this.convertCardToSlot(card))
      .sort((a, b) => a.position - b.position);
    return { id: list.id, title: list.title, position: list.position, cardSlots };
  }

  private convertCardToSlot(card: ICard | undefined): ICardSlot {
    return { position: card?.position || -1, card, view: !!card };
  }
}
