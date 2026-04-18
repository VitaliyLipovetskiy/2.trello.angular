import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BoardsResolver } from './boards-resolver';
import { BoardService } from '@app/features/home/services/board.service';
import { of } from 'rxjs';
import { IBoard } from '@app/shared/interfaces';

describe('BoardsResolver', () => {
  let boardService: { getBoards: ReturnType<typeof vi.fn> };
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    boardService = { getBoards: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: BoardService, useValue: boardService }],
    });
  });

  it('should call getBoards', () => {
    const mockBoards: IBoard[] = [{ id: 1, title: 'A' }];
    boardService.getBoards.mockReturnValue(of(mockBoards));

    TestBed.runInInjectionContext(() => {
      const result = BoardsResolver(mockRoute, mockState);
      if (result instanceof Object && 'subscribe' in result) {
        (result as ReturnType<typeof of>).subscribe((boards) => {
          expect((boards as IBoard[]).length).toBe(1);
          expect((boards as IBoard[])[0].title).toBe('A');
        });
      }
    });

    expect(boardService.getBoards).toHaveBeenCalled();
  });
});
