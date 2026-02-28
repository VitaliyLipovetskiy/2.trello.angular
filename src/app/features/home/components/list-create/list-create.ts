import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { AutofocusDirective } from '@app/shared/directives/autofocus.directive';
import { getTitleForm } from '@app/shared/helper/form-helper';

@Component({
  selector: 'tr-list-create',
  imports: [FormsModule, ReactiveFormsModule, FormField, AutofocusDirective],
  templateUrl: './list-create.html',
  styleUrl: './list-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListCreate {
  readonly handleCreateList = output<string>();
  readonly titleModel = signal({ title: '', newElement: false });
  readonly titleForm = getTitleForm(this.titleModel);
  @ViewChild('titleInput') private readonly titleInput = inject(ElementRef);

  private setDefault() {
    this.titleModel.set({ title: '', newElement: false });
    this.titleForm().reset();
  }

  handleClickAddList() {
    this.titleModel.set({ ...this.titleModel(), newElement: true });
  }

  handleClickCloseCreateList() {
    this.setDefault();
  }

  handleClickAcceptCreateList() {
    if (this.titleForm.title().valid()) {
      this.handleCreateList.emit(this.titleForm.title().value());
    }
    this.setDefault();
  }

  handleBlurTitle(e: FocusEvent) {
    e.preventDefault();
    const eventTarget = e.relatedTarget as HTMLElement;
    if (eventTarget === null) {
      this.titleInput.nativeElement.focus();
    } else if (eventTarget.className !== 'list-input') {
      this.setDefault();
    }
  }

  get isDisabledButton() {
    return this.titleForm().invalid() || !(this.titleForm().dirty() || this.titleForm().touched());
  }

  get isInvalidTitle() {
    return this.titleForm.title().invalid() && this.titleForm.title().dirty();
  }
}
