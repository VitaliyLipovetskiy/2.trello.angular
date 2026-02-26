import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ICardCreate, IList } from '@app/shared/interfaces';
import { FormsModule } from '@angular/forms';
import { Card, CardCreate } from '@app/features/home/components';
import { FormField } from '@angular/forms/signals';
import { BoardService } from '@app/features/home/services/board.service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getTitleForm } from '@app/shared/helper/form-helper';

@Component({
  selector: 'tr-list',
  imports: [Card, FormsModule, CardCreate, FormField],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List implements OnInit {
  private readonly _destroy$ = inject(DestroyRef);
  private readonly boardService = inject(BoardService);
  private readonly cdRef = inject(ChangeDetectorRef);
  listId = input.required<number>();
  list?: IList;
  boardId?: number;
  handleRemoteList = output<number>();
  titleModel = signal({ title: '', titleReadonly: true });
  titleForm = getTitleForm(this.titleModel);

  ngOnInit() {
    this.boardId = this.boardService.board()?.id;
    this.list = this.boardService.board()?.lists?.find((list) => list.id === this.listId());
    this.titleModel.set({ ...this.titleModel(), title: this.list?.title || '' });
  }

  handleClickRemoveList() {
    this.handleRemoteList.emit(this.listId());
  }

  handleRemoveCard(cardId: number) {
    const title = this.list?.cards?.find((card) => card.id === cardId)?.title;
    if (confirm('Are you sure to delete ' + title)) {
      this.boardService
        .removeCardById(this.boardId!, cardId)
        .pipe(
          tap(() => this.cdRef.markForCheck()),
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
        title: this.list?.title || '',
        titleReadonly: true,
      });
      this.titleForm().reset();
      return;
    }
    this.titleModel.set({ ...this.titleModel(), titleReadonly: true });
    if (value.trim() !== this.list?.title.trim()) {
      this.boardService
        .updateListById(this.boardId!, this.listId(), { title: value.trim() })
        .pipe(
          tap(() => {
            this.titleModel.set({ ...this.titleModel(), title: value.trim() });
            this.titleForm().reset();
          }),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleCreateCard(title: string) {
    const newCard: ICardCreate = {
      title,
      list_id: this.listId(),
      position: this.list!.cards?.map((c) => c.position).reduce((a, b) => Math.max(a, b), 0) + 1,
    };
    this.boardService
      .createCard(this.boardId!, newCard)
      .pipe(
        tap(() => this.cdRef.markForCheck()),
        takeUntilDestroyed(this._destroy$),
      )
      .subscribe();
  }
}
