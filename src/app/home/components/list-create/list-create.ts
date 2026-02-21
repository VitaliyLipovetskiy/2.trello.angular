import { ChangeDetectionStrategy, Component, ElementRef, inject, output, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, hidden, pattern, required } from '@angular/forms/signals';
import { AutofocusDirective } from '@app/helpers/autofocus.directive';

@Component({
  selector: 'tr-list-create',
  imports: [FormsModule, ReactiveFormsModule, FormField, AutofocusDirective],
  templateUrl: './list-create.html',
  styleUrl: './list-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListCreate {
  handleCreateList = output<string>();
  titleModel = signal({ title: '', newList: false });
  titleForm = form(this.titleModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Поле не може бути порожнім' });
    pattern(schemaPath.title, /^[a-zа-яіїєґ0-9-._\s]+$/i, {
      message: 'Поле може містити лише літери, 0-9, пробіли, крапки, "-" і "_"',
    });
    hidden(schemaPath.title, () => !this.titleModel().newList);
  });
  @ViewChild('titleInput') titleInput = inject(ElementRef);

  private preventDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  private setDefault() {
    this.titleModel.set({ title: '', newList: false });
    this.titleForm().reset();
  }

  handleClickAddList(e: PointerEvent) {
    this.preventDefault(e);
    this.titleModel.set({ ...this.titleModel(), newList: true });
  }

  handleClickCloseCreateList(e: MouseEvent) {
    this.preventDefault(e);
    this.setDefault();
  }

  handleClickAcceptCreateList(e: MouseEvent) {
    this.preventDefault(e);
    if (this.titleForm.title().valid()) {
      this.handleCreateList.emit(this.titleForm.title().value());
    }
    this.setDefault();
  }

  handleBlurTitle(e: FocusEvent) {
    this.preventDefault(e);
    const eventTarget = e.relatedTarget as HTMLElement;
    if (eventTarget === null) {
      this.titleInput.nativeElement.focus();
    } else if (eventTarget.className !== 'list-input') {
      this.setDefault();
    }
  }

  isDisabledTitle() {
    return this.titleForm().invalid() || !(this.titleForm().dirty() || this.titleForm().touched());
  }
}
