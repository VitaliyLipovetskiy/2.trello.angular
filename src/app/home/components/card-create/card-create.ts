import {ChangeDetectionStrategy, Component, output, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {form, FormField, hidden, pattern, required} from '@angular/forms/signals';
import {AutofocusDirective} from '@app/helpers/autofocus.directive';

@Component({
  selector: 'tr-card-create',
  imports: [ReactiveFormsModule, FormsModule, FormField, AutofocusDirective],
  templateUrl: './card-create.html',
  styleUrl: './card-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCreate {
  handleCreateCard = output<string>();
  titleModel = signal({ title: '', newCard: false });
  titleForm = form(this.titleModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Поле не може бути порожнім' });
    pattern(schemaPath.title, /^[a-zа-яіїєґ0-9-._\s]+$/i, {
      message: 'Поле може містити лише літери, 0-9, пробіли, крапки, "-" і "_"',
    });
    hidden(schemaPath.title, () => !this.titleModel().newCard);
  });

  private preventDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleClickAddCard(e: PointerEvent) {
    this.preventDefault(e);
    this.titleModel.set({ ...this.titleModel(), newCard: true });
  }

  handleClickCloseCreateCard(e: MouseEvent) {
    this.preventDefault(e);
    this.titleModel.set({ ...this.titleModel(), title: '', newCard: false });
    this.titleForm().reset();
  }

  handleClickAcceptCreateCard(e: MouseEvent) {
    this.preventDefault(e);
    if (this.titleForm.title().valid()) {
      this.handleCreateCard.emit(this.titleForm.title().value());
    }
    this.titleModel.set({ ...this.titleModel(), title: '', newCard: false });
    this.titleForm().reset();
  }
}
