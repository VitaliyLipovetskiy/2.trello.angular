import { TestBed } from '@angular/core/testing';

import { BoardsResolver } from './boards-resolver';

describe('BoardsResolver', () => {
  let resolver: BoardsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(BoardsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
