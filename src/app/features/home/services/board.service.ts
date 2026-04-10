import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, map, Observable, of, switchMap, tap } from 'rxjs';
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
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

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
  private readonly _cardUpdatedId = signal<number | undefined>(undefined);
  private readonly _listUpdatedId = signal<number | undefined>(undefined);
  private readonly _cardModal = signal(false);
  /** No public accessor — used only by drag-drop methods within this service. */
  private readonly _cardDragged = signal<ICardSlot | undefined>(undefined);
  readonly boards = this._boards.asReadonly();
  readonly board = this._board.asReadonly();
  readonly list = this._list.asReadonly();
  readonly card = this._card.asReadonly();
  readonly cardUpdatedId = this._cardUpdatedId.asReadonly();
  readonly listUpdatedId = this._listUpdatedId.asReadonly();
  readonly cardModal = this._cardModal.asReadonly();

  getBoards(): Observable<IBoard[]> {
    return this.http.get<{ boards: IBoard[] }>('board').pipe(
      map((response) => response.boards),
      tap((boards) => this._boards.set(boards)),
      catchError((error) => this.handleError(error)),
    );
  }

  getBoardById(id: number): Observable<IBoardSlot> {
    return this.http.get<IBoard>(`board/${id}`).pipe(
      map((board) => {
        const lists = board.lists?.map((list) => this.convertListToSlot(list));
        // board is not have id
        return { ...board, id, lists } as IBoardSlot;
      }),
      tap((boardSlot) => this._board.set(boardSlot)),
      catchError((error) => this.handleError(error)),
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
      catchError((error) => this.handleError(error)),
    );
  }

  updateBoard(id: number, data: IBoardUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${id}`, data).pipe(
      tap(({ result }) => {
        if (result === 'Updated') {
          const currentBoard = this.board();
          if (!currentBoard) return;
          const board: IBoardSlot = {
            ...currentBoard,
            title: data.title,
            custom: data.custom ?? currentBoard.custom,
          };
          this._board.set(board);
          this.toastr.success('Board updated successfully!', 'Success!');
        } else {
          this.toastr.error('Board not updated!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  removeBoardById(id: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${id}`).pipe(
      tap(({ result }) => {
        if (result === 'Deleted') {
          this._boards.update((items) => items.filter((board) => board.id !== id));
          this.toastr.success('Board removed successfully!', 'Success!');
        } else {
          this.toastr.error('Board not removed!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  createList(boardId: number, data: IListCreate): Observable<IResultCreated> {
    return this.http.post<IResultCreated>(`board/${boardId}/list`, data).pipe(
      tap(({ result, id }) => {
        if (result === 'Created') {
          const currentBoard = this.board();
          if (!currentBoard) return;
          const list: IList = { id, title: data.title, position: data.position, cards: [] };
          const board: IBoardSlot = {
            ...currentBoard,
            lists: [...(currentBoard.lists ?? []), this.convertListToSlot(list)],
          };
          this._board.set(board);
          this.toastr.success('List created successfully!', 'Success!');
        } else {
          this.toastr.error('List not created!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  updateListById(boardId: number, listId: number, data: IListUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${boardId}/list/${listId}`, data).pipe(
      tap(({ result }) => {
        if (result === 'Updated') {
          const currentBoard = this.board();
          if (!currentBoard) return;
          let updatedListSlot;
          const listSlots: IListSlot[] =
            currentBoard.lists?.map((listSlot) => {
              if (listSlot.id === listId) {
                updatedListSlot = { ...listSlot, title: data.title } as IListSlot;
                return updatedListSlot;
              } else {
                return listSlot;
              }
            }) ?? [];
          this._list.set(updatedListSlot);
          this._listUpdatedId.set(listId);
          this._board.set({ ...currentBoard, lists: listSlots });
          this.toastr.success('List updated successfully!', 'Success!');
        } else {
          this.toastr.error('List not updated!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  removeListById(boardId: number, listId: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${boardId}/list/${listId}`).pipe(
      tap(({ result }) => {
        if (result === 'Deleted') {
          this._board.update((board) => {
            const lists = board?.lists?.filter((listSlot) => listSlot.id !== listId) ?? [];
            return board ? { ...board, lists } : board;
          });
          this.toastr.success('List deleted successfully!', 'Success!');
        } else {
          this.toastr.error('List not deleted!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  getCardById(boardId: number, cardId: number): Observable<ICardSlot | undefined> {
    const existingBoard = this._board();
    if (existingBoard?.id === boardId) {
      const listSlot = existingBoard.lists?.find((list) =>
        list.cardSlots.some((c) => c.card?.id === cardId),
      );
      const cardSlot = listSlot?.cardSlots.find((c) => c.card?.id === cardId);
      if (cardSlot) {
        this._list.set(listSlot);
        this._card.set(cardSlot);
        return of(cardSlot);
      }
    }
    return this.http.get<IBoard>(`board/${boardId}`).pipe(
      map((board) => {
        const listSlots = board.lists?.map((list) => this.convertListToSlot(list)) ?? [];
        const boardSlot: IBoardSlot = { ...board, id: boardId, lists: listSlots };
        const listSlot = listSlots.find((l) => l.cardSlots.some((c) => c.card?.id === cardId));
        const cardSlot = listSlot?.cardSlots.find((c) => c.card?.id === cardId);
        return { boardSlot, listSlot, cardSlot };
      }),
      tap(({ boardSlot, listSlot, cardSlot }) => {
        this._board.set(boardSlot);
        this._list.set(listSlot);
        this._card.set(cardSlot);
      }),
      map(({ cardSlot }) => cardSlot),
      catchError((error) => this.handleError(error)),
    );
  }

  createCard(boardId: number, data: ICardCreate): Observable<IResultCreated> {
    return this.http.post<IResultCreated>(`board/${boardId}/card`, data).pipe(
      tap(({ result, id }) => {
        if (result === 'Created') {
          this._board.update((board) => {
            if (!board) return board;
            const lists =
              board.lists?.map((listSlot) => this.appendCardToList(listSlot, data, id)) ?? [];
            return { ...board, lists };
          });
          this.toastr.success('Card created successfully!', 'Success!');
        } else {
          this.toastr.error('Card not created!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  updateCardById(boardId: number, cardId: number, data: ICardUpdate): Observable<IResult> {
    return this.http.put<IResult>(`board/${boardId}/card/${cardId}`, data).pipe(
      tap(({ result }) => {
        if (result === 'Updated') {
          this._board.update((board) => {
            if (!board) return board;
            const listSlots = board.lists?.map((listSlot) =>
              this.patchListSlot(listSlot, cardId, data),
            );
            return { ...board, lists: listSlots };
          });
          this._cardUpdatedId.set(cardId);
          this.toastr.success('Card updated successfully!', 'Success!');
        } else {
          this.toastr.error('Card not updated!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  updateGroupCards(boardId: number, data: ICardsUpdate[]): Observable<IBoardSlot> {
    return this.http.put<IResult>(`board/${boardId}/card`, data).pipe(
      switchMap(({ result }) => {
        if (result !== 'Updated') {
          this.toastr.error('Card not updated!', 'Error!');
          return EMPTY;
        }
        this.toastr.success('Cards updated successfully!', 'Success!');
        return this.getBoardById(boardId);
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  removeCardById(boardId: number, listId: number, cardId: number): Observable<IResult> {
    return this.http.delete<IResult>(`board/${boardId}/card/${cardId}`).pipe(
      tap(({ result }) => {
        if (result === 'Deleted') {
          this._board.update((board) => {
            if (!board) return board;
            const lists = board.lists?.map((listSlot) =>
              this.removeCardFromList(listSlot, listId, cardId),
            );
            return { ...board, lists };
          });
          this._listUpdatedId.set(listId);
          this.toastr.success('Card removed successfully!', 'Success!');
        } else {
          this.toastr.error('Card not deleted!', 'Error!');
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  setCard(cardSlot: ICardSlot | undefined, listSlot: IListSlot | undefined) {
    this._card.set(cardSlot);
    this._list.set(listSlot);
  }

  clearCardUpdatedId() {
    this._cardUpdatedId.set(undefined);
  }

  clearListUpdatedId() {
    this._listUpdatedId.set(undefined);
  }

  setCardModal(cardModal: boolean) {
    this._cardModal.set(cardModal);
    if (!cardModal) {
      this._card.set(undefined);
    }
  }

  showPlaceholderSlot(position: number, listSlot: IListSlot) {
    const cardDragged = this._cardDragged();

    const sourceList = this.board()?.lists?.find((l) =>
      l.cardSlots.some((s) => s.card?.id === cardDragged?.card?.id),
    );

    if (cardDragged?.card && listSlot.id === sourceList?.id) {
      const currentPos = cardDragged.card.position;
      if (position === currentPos || position === currentPos + 1) {
        const hasVisiblePlaceholder = listSlot.cardSlots.some((s) => !s.card && s.view);
        if (hasVisiblePlaceholder) {
          this.hidePlaceholderSlot(listSlot);
        }
        return;
      }
    }

    const currentPlaceholder = listSlot.cardSlots.find((s) => !s.card);
    if (currentPlaceholder?.view && currentPlaceholder.position === position) {
      return;
    }

    const cards = listSlot.cardSlots.filter((s) => !!s.card).map((s) => s.card!);

    const newCardSlots: ICardSlot[] = cards.map((card) => {
      const shouldShift = card.position >= position;
      return {
        card,
        view: true,
        position: card.position + (shouldShift ? 1 : 0),
      };
    });
    const placeholder = {
      card: undefined,
      view: true,
      position: position,
    };
    const newList = {
      ...listSlot,
      cardSlots: [...newCardSlots, placeholder].sort((a, b) => a.position - b.position),
    };

    this._board.update((board) => {
      if (!board) return board;
      return {
        ...board,
        lists: board.lists?.map((l) => (l.id === listSlot.id ? newList : l)),
      };
    });
  }

  hidePlaceholderSlot(listSlot: IListSlot) {
    const cardSlots = listSlot.cardSlots.map((cardSlot) => ({
      ...cardSlot,
      view: !!cardSlot.card,
      position: cardSlot.card?.position ?? 0,
    }));
    const currentList = { ...listSlot, cardSlots };
    this._list.set(currentList);

    const currentBoard = this.board();
    if (!currentBoard) return;
    const listSlots: IListSlot[] =
      currentBoard.lists?.map((list) => (list.id === currentList.id ? currentList : list)) ?? [];
    this._board.set({ ...currentBoard, lists: listSlots });
  }

  setCardDragged(cardId: number | undefined, listId: number | undefined) {
    if (cardId != null && listId != null) {
      const cardDragged = this.board()
        ?.lists?.find((list) => list.id === listId)
        ?.cardSlots?.find((card) => card.card?.id === cardId);
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

  private appendCardToList(listSlot: IListSlot, data: ICardCreate, id: number) {
    if (listSlot.id !== data.list_id) return listSlot;
    const newCard: ICard = {
      id,
      title: data.title.trim(),
      position: data.position,
      users: [],
    };
    const cardSlot: ICardSlot = { position: data.position, card: newCard, view: true };
    return { ...listSlot, cardSlots: [...listSlot.cardSlots, cardSlot] };
  }

  private patchCardSlot(cardSlot: ICardSlot, cardId: number, data: ICardUpdate): ICardSlot {
    if (cardSlot.card?.id !== cardId) return cardSlot;
    return {
      ...cardSlot,
      card: { ...cardSlot.card, title: data.title.trim(), description: data.description?.trim() },
    };
  }

  private patchListSlot(listSlot: IListSlot, cardId: number, data: ICardUpdate): IListSlot {
    if (listSlot.id !== data.list_id) return listSlot;
    const cardSlots = listSlot.cardSlots.map((cardSlot) =>
      this.patchCardSlot(cardSlot, cardId, data),
    );
    return { ...listSlot, cardSlots };
  }

  private removeCardFromList(listSlot: IListSlot, listId: number, cardId: number): IListSlot {
    if (listSlot.id !== listId) return listSlot;
    return { ...listSlot, cardSlots: listSlot.cardSlots.filter((cs) => cs.card?.id !== cardId) };
  }

  private convertListToSlot(list: IList): IListSlot {
    const cardSlots = [...list.cards, undefined]
      .map((card) => this.convertCardToSlot(card))
      .sort((a, b) => a.position - b.position);
    return { id: list.id, title: list.title, position: list.position, cardSlots };
  }

  private convertCardToSlot(card: ICard | undefined): ICardSlot {
    return { position: card?.position ?? -1, card, view: !!card };
  }

  private handleError(error: unknown): Observable<never> {
    console.error(error);
    if (error instanceof HttpErrorResponse) {
      this.toastr.error(error.error?.message, 'Error!');
    } else {
      this.toastr.error('Something went wrong!', 'Error!');
    }
    return EMPTY;
  }
}
