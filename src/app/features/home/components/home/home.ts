import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BoardCreate } from '@app/features/home/components';
import { BoardService } from '@app/features/home/services/board.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'tr-home',
  imports: [RouterLink, BoardCreate],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly _destroy$ = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly boardService = inject(BoardService);
  boards = this.boardService.boards;
  boardModal = false;

  ngOnInit() {
    this.activatedRoute.data.pipe(takeUntilDestroyed(this._destroy$)).subscribe();
  }

  handleCreateBoard(title: string) {
    this.boardService
      .createBoard(title)
      .pipe(
        tap(() => (this.boardModal = false)),
        takeUntilDestroyed(this._destroy$),
      )
      .subscribe();
  }

  protected handleClickAddBoard() {
    this.boardModal = true;
  }

  handleModalClickClose() {
    this.boardModal = false;
  }

  handleClickRemoveBoard(e: MouseEvent, boardId: number) {
    e.preventDefault();
    e.stopPropagation();
    const title = this.boards().find((board) => board.id === boardId)?.title;
    if (confirm('Are you sure to delete ' + title)) {
      this.boardService
        .removeBoardById(boardId)
        .pipe(takeUntilDestroyed(this._destroy$))
        .subscribe();
    }
  }
}
