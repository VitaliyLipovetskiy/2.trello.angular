import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BoardResolver } from './board-resolver';
import { BoardService } from '@app/features/home/services/board.service';
import { of } from 'rxjs';
import { IBoardSlot } from '@app/shared/interfaces';

describe('BoardResolver', () => {
  let boardService: { getBoardById: ReturnType<typeof vi.fn> };
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    boardService = { getBoardById: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: BoardService, useValue: boardService }],
    });
  });

  it('should call getBoardById with numeric id', () => {
    const mockBoard: IBoardSlot = { id: 5, title: 'Test', lists: [] };
    boardService.getBoardById.mockReturnValue(of(mockBoard));

    const route = { paramMap: { get: () => '5' } } as unknown as ActivatedRouteSnapshot;

    TestBed.runInInjectionContext(() => {
      const result = BoardResolver(route, mockState);
      if (result instanceof Object && 'subscribe' in result) {
        (result as ReturnType<typeof of>).subscribe((board) => {
          expect((board as IBoardSlot).id).toBe(5);
        });
      }
    });

    expect(boardService.getBoardById).toHaveBeenCalledWith(5);
  });

  it('should throw on missing id', () => {
    const route = { paramMap: { get: () => null } } as unknown as ActivatedRouteSnapshot;

    expect(() => {
      TestBed.runInInjectionContext(() => BoardResolver(route, mockState));
    }).toThrowError('Bad id');
  });

  it('should throw on non-numeric id', () => {
    const route = { paramMap: { get: () => 'abc' } } as unknown as ActivatedRouteSnapshot;

    expect(() => {
      TestBed.runInInjectionContext(() => BoardResolver(route, mockState));
    }).toThrowError('Bad id');
  });
});
