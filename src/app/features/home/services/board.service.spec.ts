import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BoardService } from './board.service';
import { ToastrService } from 'ngx-toastr';
import { IBoard, ICard, IList } from '@app/shared/interfaces';

describe('BoardService', () => {
  let service: BoardService;
  let httpMock: HttpTestingController;
  let toastrService: ToastrService;

  const mockCard: ICard = { id: 1, title: 'Card 1', position: 1, users: [] };
  const mockCard2: ICard = { id: 2, title: 'Card 2', position: 2, users: [] };
  const mockList: IList = { id: 10, title: 'List 1', position: 1, cards: [mockCard, mockCard2] };
  const mockBoard: IBoard = { id: 100, title: 'Board 1', lists: [mockList] };

  beforeEach(() => {
    toastrService = {
      success: vi.fn(),
      error: vi.fn(),
    } as unknown as ToastrService;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BoardService,
        { provide: ToastrService, useValue: toastrService },
      ],
    });

    service = TestBed.inject(BoardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getBoards', () => {
    it('should fetch boards and update signal', () => {
      const boards: IBoard[] = [
        { id: 1, title: 'B1' },
        { id: 2, title: 'B2' },
      ];

      service.getBoards().subscribe((result) => {
        expect(result).toEqual(boards);
      });

      const req = httpMock.expectOne('board');
      expect(req.request.method).toBe('GET');
      req.flush({ boards });

      expect(service.boards()).toEqual(boards);
    });

    it('should handle error and show toastr', () => {
      service.getBoards().subscribe();

      const req = httpMock.expectOne('board');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Error' });

      expect(toastrService.error).toHaveBeenCalled();
    });
  });

  describe('getBoardById', () => {
    it('should fetch board, convert to slots, and set signal', () => {
      service.getBoardById(100).subscribe((result) => {
        expect(result.id).toBe(100);
        expect(result.title).toBe('Board 1');
        expect(result.lists?.length).toBe(1);
        expect(result.lists![0].cardSlots.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne('board/100');
      expect(req.request.method).toBe('GET');
      req.flush(mockBoard);

      expect(service.board()?.id).toBe(100);
    });
  });

  describe('createBoard', () => {
    it('should create board and update boards list', () => {
      service.createBoard('New Board').subscribe();

      const req = httpMock.expectOne('board');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'New Board' });
      req.flush({ result: 'Created', id: 5 });

      expect(service.boards()).toEqual([{ id: 5, title: 'New Board' }]);
      expect(toastrService.success).toHaveBeenCalled();
    });

    it('should show error toastr on non-Created result', () => {
      service.createBoard('Fail').subscribe();

      const req = httpMock.expectOne('board');
      req.flush({ result: 'Error', id: 0 });

      expect(toastrService.error).toHaveBeenCalledWith('Board not created!', 'Error!');
    });
  });

  describe('updateBoard', () => {
    it('should update board signal and boards list', () => {
      // Set up initial state
      service.getBoards().subscribe();
      httpMock.expectOne('board').flush({ boards: [{ id: 100, title: 'Old' }] });

      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service.updateBoard(100, { title: 'Updated' }).subscribe();

      const req = httpMock.expectOne('board/100');
      expect(req.request.method).toBe('PUT');
      req.flush({ result: 'Updated' });

      expect(service.board()?.title).toBe('Updated');
      expect(service.boards().find((b) => b.id === 100)?.title).toBe('Updated');
      expect(toastrService.success).toHaveBeenCalled();
    });
  });

  describe('removeBoardById', () => {
    it('should remove board from boards list', () => {
      service.getBoards().subscribe();
      httpMock.expectOne('board').flush({
        boards: [
          { id: 1, title: 'A' },
          { id: 2, title: 'B' },
        ],
      });

      service.removeBoardById(1).subscribe();
      httpMock.expectOne('board/1').flush({ result: 'Deleted' });

      expect(service.boards().length).toBe(1);
      expect(service.boards()[0].id).toBe(2);
      expect(toastrService.success).toHaveBeenCalled();
    });
  });

  describe('createList', () => {
    it('should add list to current board', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush({ ...mockBoard, lists: [] });

      service.createList(100, { title: 'New List', position: 1 }).subscribe();
      httpMock.expectOne('board/100/list').flush({ result: 'Created', id: 20 });

      expect(service.board()?.lists?.length).toBe(1);
      expect(service.board()?.lists![0].title).toBe('New List');
    });
  });

  describe('updateListById', () => {
    it('should update list title in board', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service.updateListById(100, 10, { title: 'Renamed' }).subscribe();
      httpMock.expectOne('board/100/list/10').flush({ result: 'Updated' });

      expect(service.board()?.lists?.find((l) => l.id === 10)?.title).toBe('Renamed');
      expect(service.listUpdatedId()).toBe(10);
    });
  });

  describe('removeListById', () => {
    it('should remove list from board', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service.removeListById(100, 10).subscribe();
      httpMock.expectOne('board/100/list/10').flush({ result: 'Deleted' });

      expect(service.board()?.lists?.length).toBe(0);
    });
  });

  describe('createCard', () => {
    it('should add card to the correct list', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      const cardsBefore = service.board()!.lists![0].cardSlots.filter((s) => !!s.card).length;

      service.createCard(100, { title: 'New Card', list_id: 10, position: 3 }).subscribe();
      httpMock.expectOne('board/100/card').flush({ result: 'Created', id: 50 });

      const cardsAfter = service.board()!.lists![0].cardSlots.filter((s) => !!s.card).length;
      expect(cardsAfter).toBe(cardsBefore + 1);
    });
  });

  describe('updateCardById', () => {
    it('should update card title and description', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service
        .updateCardById(100, 1, { title: 'Updated Card', list_id: 10, description: 'desc' })
        .subscribe();
      httpMock.expectOne('board/100/card/1').flush({ result: 'Updated' });

      const card = service.board()?.lists![0].cardSlots.find((s) => s.card?.id === 1);
      expect(card?.card?.title).toBe('Updated Card');
      expect(card?.card?.description).toBe('desc');
      expect(service.cardUpdatedId()).toBe(1);
    });
  });

  describe('removeCardById', () => {
    it('should remove card from list', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service.removeCardById(100, 10, 1).subscribe();
      httpMock.expectOne('board/100/card/1').flush({ result: 'Deleted' });

      const hasCard = service.board()?.lists![0].cardSlots.some((s) => s.card?.id === 1);
      expect(hasCard).toBe(false);
    });
  });

  describe('getCardById', () => {
    it('should return card from existing board state', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service.getCardById(100, 1).subscribe((cardSlot) => {
        expect(cardSlot?.card?.id).toBe(1);
      });

      expect(service.card()?.card?.id).toBe(1);
      expect(service.list()?.id).toBe(10);
    });

    it('should fetch board if card not found locally', () => {
      service.getCardById(200, 1).subscribe((cardSlot) => {
        expect(cardSlot?.card?.id).toBe(1);
      });

      httpMock.expectOne('board/200').flush({ ...mockBoard, id: 200 });

      expect(service.board()?.id).toBe(200);
    });
  });

  describe('setCardModal', () => {
    it('should set modal state and clear card on close', () => {
      service.setCardModal(true);
      expect(service.cardModal()).toBe(true);

      service.setCardModal(false);
      expect(service.cardModal()).toBe(false);
      expect(service.card()).toBeUndefined();
    });
  });

  describe('clearCardUpdatedId / clearListUpdatedId', () => {
    it('should clear updated ids', () => {
      service.clearCardUpdatedId();
      expect(service.cardUpdatedId()).toBeUndefined();

      service.clearListUpdatedId();
      expect(service.listUpdatedId()).toBeUndefined();
    });
  });

  describe('placeholder slot management', () => {
    beforeEach(() => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);
    });

    it('showPlaceholderSlot should add a placeholder card slot', () => {
      const listSlot = service.board()!.lists![0];
      service.showPlaceholderSlot(1, listSlot);

      const updatedList = service.board()!.lists![0];
      const placeholder = updatedList.cardSlots.find((s) => !s.card && s.view);
      expect(placeholder).toBeTruthy();
    });

    it('hidePlaceholderSlot should remove placeholder visibility', () => {
      const listSlot = service.board()!.lists![0];
      service.showPlaceholderSlot(1, listSlot);

      const updatedList = service.board()!.lists![0];
      service.hidePlaceholderSlot(updatedList);

      const finalList = service.board()!.lists![0];
      const visiblePlaceholder = finalList.cardSlots.find((s) => !s.card && s.view);
      expect(visiblePlaceholder).toBeFalsy();
    });
  });

  describe('drag state management', () => {
    it('setListDragged should set/clear dragged list id', () => {
      service.setListDragged(5);
      expect(service.listDraggedId()).toBe(5);

      service.setListDragged(undefined);
      expect(service.listDraggedId()).toBeUndefined();
    });

    it('setListPlaceholderIndex should update index', () => {
      service.setListPlaceholderIndex(3);
      expect(service.listPlaceholderIndex()).toBe(3);

      service.setListPlaceholderIndex(undefined);
      expect(service.listPlaceholderIndex()).toBeUndefined();
    });
  });

  describe('updateGroupCards', () => {
    it('should update cards and re-fetch board', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service.updateGroupCards(100, [{ id: 1, position: 2, list_id: 10 }]).subscribe();

      const putReq = httpMock.expectOne('board/100/card');
      expect(putReq.request.method).toBe('PUT');
      putReq.flush({ result: 'Updated' });

      httpMock.expectOne('board/100').flush(mockBoard);

      expect(toastrService.success).toHaveBeenCalled();
    });
  });

  describe('updateGroupLists', () => {
    it('should update lists and re-fetch board', () => {
      service.getBoardById(100).subscribe();
      httpMock.expectOne('board/100').flush(mockBoard);

      service.updateGroupLists(100, [{ id: 10, position: 2 }]).subscribe();

      const putReq = httpMock.expectOne('board/100/list');
      expect(putReq.request.method).toBe('PUT');
      putReq.flush({ result: 'Updated' });

      httpMock.expectOne('board/100').flush(mockBoard);

      expect(toastrService.success).toHaveBeenCalled();
    });
  });
});
