import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { IBoardUpdate, IListCreate } from '@app/shared/interfaces';
import { List } from '../list/list';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListCreate } from '@app/features/home/components';
import { FormField } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoardService } from '@app/features/home/services/board.service';
import { getTitleForm } from '@app/shared/helper/form-helper';

@Component({
  selector: 'tr-board',
  imports: [List, RouterLink, FormsModule, ReactiveFormsModule, ListCreate, FormField],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Board implements OnInit {
  private readonly _destroy$ = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);
  boardId = signal<number>(0);
  private readonly boardService = inject(BoardService);
  board = this.boardService.board();
  titleModel = signal({ title: '', backgroundColor: '', titleReadonly: true });
  titleForm = getTitleForm(this.titleModel);

  ngOnInit() {
    this.initBoard();
    this.titleForm.title().focusBoundControl();
  }

  private initBoard(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.boardId.set(params['id']);
    });
    this.activatedRoute.data
      .pipe(
        tap(({ board }) => {
          this.titleModel.set({
            ...this.titleModel(),
            title: board.title,
            backgroundColor: board.custom?.background,
          });
        }),
      )
      .subscribe();
  }

  handleColorChange(e: Event) {
    e.stopPropagation();
    const { value } = e.target as HTMLInputElement;
    if (value !== this.titleModel().backgroundColor) {
      const boardData: IBoardUpdate = {
        title: this.titleForm.title().value(),
        custom: { background: value },
      };
      this.boardService
        .updateBoard(this.boardId(), boardData)
        .pipe(
          tap(() => this.titleModel.set({ ...this.titleModel(), backgroundColor: value })),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleTitleClick() {
    this.titleModel.set({ ...this.titleModel(), titleReadonly: false });
  }

  handleTitleBlur(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (this.titleForm.title().invalid()) {
      this.titleModel.set({
        ...this.titleModel(),
        title: this.board?.title || '',
        titleReadonly: true,
      });
      this.titleForm().reset();
      return;
    }
    this.titleModel.set({ ...this.titleModel(), titleReadonly: true });
    if (value.trim() !== this.board?.title.trim()) {
      this.boardService
        .updateBoard(this.boardId(), { title: value.trim() })
        .pipe(
          tap(() => this.titleModel.set({ ...this.titleModel(), title: value.trim() })),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleCreateList(title: string) {
    const listData: IListCreate = {
      title,
      position: (this.board?.lists?.length || 0) + 1,
    };
    this.boardService
      .createList(this.boardId(), listData)
      .pipe(
        tap(() => this.cdRef.markForCheck()),
        takeUntilDestroyed(this._destroy$),
      )
      .subscribe();
  }

  handleRemoteList(listId: number) {
    const title = this.board?.lists?.find((list) => list.id === listId)?.title;
    if (confirm('Are you sure to delete ' + title)) {
      this.boardService
        .removeListById(this.boardId(), listId)
        .pipe(
          tap(() => this.cdRef.markForCheck()),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  get isInvalidTitle() {
    return (
      this.titleForm.title().invalid() &&
      (this.titleForm.title().dirty() || this.titleForm.title().touched())
    );
  }
}
