import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {BoardsService} from '@app/home/services/boards-service';
import {form, FormField, pattern, readonly, required} from '@angular/forms/signals';
import {ICardUpdate} from '@app/common/interfaces';

@Component({
  selector: 'tr-card',
  imports: [FormField],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card implements OnInit {
  private readonly boardsService = inject(BoardsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  boardId = input.required<number>();
  listId = input.required<number>();
  cardId = input.required<number>();
  title = input.required<string>();
  handleRemoteCard = output<number>();
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

  handleClickRemoveCard(e: PointerEvent) {
    this.preventDefault(e);
    this.handleRemoteCard.emit(this.cardId());
  }

  handleTitleClick(e: PointerEvent) {
    this.preventDefault(e);
    this.titleModel.set({ ...this.titleModel(), titleReadonly: false });
  }

  handleTitleBlur(e: FocusEvent) {
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
      const cardData: ICardUpdate = {
        title: value.trim(),
        list_id: this.listId(),
      };
      this.boardsService
        .updateCardById(this.boardId(), this.cardId(), cardData)
        .subscribe(({ result }) => {
          if (result === 'Updated') {
            this.titleModel.set({ ...this.titleModel(), title: value.trim() });
          }
        });
      this.titleForm().reset();
    }
  }
}
