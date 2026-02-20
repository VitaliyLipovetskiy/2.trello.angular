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
import { ICard, ICardCreate, IListUpdate } from '@app/common/interfaces';
import { FormsModule } from '@angular/forms';
import { Card, CardCreate } from '@app/home/components';
import { form, FormField, pattern, readonly, required } from '@angular/forms/signals';
import { BoardsService } from '@app/home/services/boards-service';
import { ToastrService } from 'ngx-toastr';

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
  private readonly toastr = inject(ToastrService);
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
    try {
      this.boardsService.removeCardById(this.boardId(), cardId).subscribe(({ result }) => {
        if (result === 'Deleted') {
          this.cards.set(this.cards().filter((card) => card.id !== cardId));
          this.cdRef.markForCheck();
          this.toastr.success('Card removed successfully!', 'Success!');
        } else {
          this.toastr.error('Card not deleted!', 'Error!');
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        this.toastr.error(error.message, 'Error!');
      } else {
        throw error;
      }
    }
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
      const listData: IListUpdate = {
        title: value.trim(),
      };
      try {
        this.boardsService
          .updateListById(this.boardId(), this.listId(), listData)
          .subscribe(({ result }) => {
            if (result === 'Updated') {
              this.titleModel.set({ ...this.titleModel(), title: value.trim() });
              this.toastr.success('List updated successfully!', 'Success!');
            } else {
              this.toastr.error('List not updated!', 'Error!');
            }
          });
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          this.toastr.error(error.message, 'Error!');
        } else {
          throw error;
        }
      }
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
    try {
      this.boardsService.createCard(this.boardId(), newCard).subscribe(({ result, id }) => {
        if (result === 'Created') {
          const card: ICard = { id, title, position: newCard.position, users: [] };
          this.cards().push(card);
          this.cdRef.markForCheck();
          this.toastr.success('Card created successfully!', 'Success!');
        } else {
          this.toastr.error('Card not created!', 'Error!');
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        this.toastr.error(error.message, 'Error!');
      } else {
        throw error;
      }
    }
  }
}
