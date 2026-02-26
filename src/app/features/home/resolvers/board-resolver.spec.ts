import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { boardResolver } from './board-resolver';
import { IBoard } from '../../common/interfaces/board/Iboard.interface';

describe('boardResolver', () => {
  const executeResolver: ResolveFn<IBoard> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => boardResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
