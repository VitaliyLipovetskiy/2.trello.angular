import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ICard, ICardCreate } from '@app/common/interfaces';
import { FormsModule } from '@angular/forms';
import { Card, CardCreate } from '@app/home/components';
import { form, FormField, pattern, readonly, required } from '@angular/forms/signals';
import { BoardsService } from '@app/home/services/boards-service';

@Component({
  selector: 'tr-list',
  imports: [Card, FormsModule, CardCreate, FormField],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List implements OnInit {
  private readonly boardsService = inject(BoardsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  boardId = input.required<number>();
  listId = input.required<number>();
  title = input.required<string>();
  cards = model.required<ICard[]>();
  handleRemoteList = output<number>();
  titleModel = signal({ title: '', titleReadonly: true });
  titleForm = form(this.titleModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Поле не може бути порожнім' });
    pattern(schemaPath.title, /^[a-zа-яіїєґ0-9-._\s]+$/i, {
      message: 'Поле може містити лише літери, 0-9, пробіли, крапки, "-" і "_"',
    });
    readonly(schemaPath.title, () => this.titleModel().titleReadonly);
  });

  ngOnInit() {
    this.titleModel.set({ ...this.titleModel(), title: this.title() });
  }

  private preventDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleClickRemoveList(e: Event) {
    this.preventDefault(e);
    this.handleRemoteList.emit(this.listId());
  }

  handleRemoveCard(cardId: number) {
    this.boardsService.removeCardById(this.boardId(), cardId).subscribe(({ result }) => {
      if (result === 'Deleted') {
        this.cards.set(this.cards().filter((card) => card.id !== cardId));
        this.cdRef.markForCheck();
      }
    });
  }

  handleTitleClick(e: Event) {
    this.preventDefault(e);
    this.titleModel.set({ ...this.titleModel(), titleReadonly: false });
  }

  handleTitleBlur(e: Event) {
    this.preventDefault(e);
    const { value } = e.target as HTMLInputElement;
    if (this.titleForm.title().invalid()) {
      this.titleModel.set({
        ...this.titleModel(),
        title: this.title() || '',
        titleReadonly: true,
      });
      this.titleForm().reset();
      return;
    }
    this.titleModel.set({ ...this.titleModel(), titleReadonly: true });
    if (value.trim() !== this.title().trim()) {
      this.boardsService
        .updateListById(this.boardId(), this.listId(), {
          title: value.trim(),
        })
        .subscribe(({ result }) => {
          if (result === 'Updated') {
            this.titleModel.set({ ...this.titleModel(), title: value.trim() });
          }
        });
      this.titleForm().reset();
    }
  }

  handleCreateCard(title: string) {
    const newCard: ICardCreate = {
      title,
      list_id: this.listId(),
      position:
        this.cards()
          .map((c) => c.position)
          .reduce((a, b) => Math.max(a, b), 0) + 1,
    };
    this.boardsService.createCard(this.boardId(), newCard).subscribe(({ result, id }) => {
      if (result === 'Created') {
        const card: ICard = { id, title, position: newCard.position, users: [] };
        this.cards().push(card);
        this.cdRef.markForCheck();
      }
    });
  }
}
