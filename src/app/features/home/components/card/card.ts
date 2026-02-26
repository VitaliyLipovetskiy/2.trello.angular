import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ICardUpdate } from '@app/shared/interfaces';
import { BoardService } from '@app/features/home/services/board.service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getTitleForm } from '@app/shared/helper/form-helper';

@Component({
  selector: 'tr-card',
  imports: [FormField],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card implements OnInit {
  private readonly _destroy$ = inject(DestroyRef);
  private readonly boardService = inject(BoardService);
  cardId = input.required<number>();
  board = this.boardService.board();
  boardId?: number;
  listId?: number;
  title?: string;
  handleRemoteCard = output<number>();
  titleModel = signal({ title: '', titleReadonly: true });
  titleForm = getTitleForm(this.titleModel);

  ngOnInit() {
    this.boardId = this.boardService.board()?.id;
    this.listId = this.boardService
      .board()
      ?.lists?.find((list) => list.cards?.some((card) => card.id === this.cardId()))?.id;
    this.title = this.boardService
      .board()
      ?.lists?.flatMap((list) => list.cards)
      ?.find((card) => card.id === this.cardId())?.title;
    this.titleModel.set({ ...this.titleModel(), title: this.title || '' });
  }

  handleClickRemoveCard() {
    this.handleRemoteCard.emit(this.cardId());
  }

  handleTitleClick() {
    this.titleModel.set({ ...this.titleModel(), titleReadonly: false });
  }

  handleTitleBlur(e: FocusEvent) {
    const { value } = e.target as HTMLInputElement;
    if (this.titleForm.title().invalid()) {
      this.titleModel.set({
        ...this.titleModel(),
        title: this.title || '',
        titleReadonly: true,
      });
      this.titleForm().reset();
      return;
    }
    this.titleModel.set({ ...this.titleModel(), titleReadonly: true });
    if (value.trim() !== this.title?.trim()) {
      const cardData: ICardUpdate = {
        title: value.trim(),
        list_id: this.listId!,
      };
      this.boardService
        .updateCardById(this.boardId!, this.cardId(), cardData)
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
}
