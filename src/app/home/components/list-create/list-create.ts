import {ChangeDetectionStrategy, Component, output, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {form, FormField, pattern, required} from '@angular/forms/signals';
import {AutofocusDirective} from '@app/helpers/autofocus.directive';

@Component({
  selector: 'tr-list-create',
  imports: [FormsModule, ReactiveFormsModule, FormField, AutofocusDirective],
  templateUrl: './list-create.html',
  styleUrl: './list-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListCreate {
  handleCreateList = output<string>();
  listNew = false;
  titleModel = signal({ title: '' });
  titleForm = form(this.titleModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Поле не може бути порожнім' });
    pattern(schemaPath.title, /^[a-zа-яіїєґ0-9-._\s]+$/i, {
      message: 'Поле може містити лише літери, 0-9, пробіли, крапки, "-" і "_"',
    });
  });

  private preventDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleClickAddList() {
    this.listNew = true;
    this.titleForm.title().reset();
    this.titleModel.set({ title: '' });
  }

  handleClickAcceptCreateList(e: MouseEvent) {
    this.preventDefault(e);
    if (this.titleForm.title().valid()) {
      this.handleCreateList.emit(this.titleForm.title().value());
    }
    this.listNew = false;
  }

  handleClickCloseCreateList(e: MouseEvent) {
    this.preventDefault(e);
    this.listNew = false;
  }
}
