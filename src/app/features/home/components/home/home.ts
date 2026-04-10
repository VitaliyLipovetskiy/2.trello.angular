import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BoardCreate } from '@app/features/home/components';
import { BoardService } from '@app/features/home/services/board.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { ConfirmService } from '@app/shared/services/confirm.service';

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
  private readonly confirmService = inject(ConfirmService);
  readonly boards = this.boardService.boards;
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

  async handleClickRemoveBoard(e: MouseEvent, boardId: number) {
    e.preventDefault();
    e.stopPropagation();
    const title = this.boards().find((board) => board.id === boardId)?.title;
    if (await this.confirmService.confirm(`Видалити дошку "${title}"?`)) {
      this.boardService
        .removeBoardById(boardId)
        .pipe(takeUntilDestroyed(this._destroy$))
        .subscribe();
    }
  }
}
