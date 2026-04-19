import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { AutofocusDirective } from '@app/shared/directives/autofocus.directive';
import { getTitleForm } from '@app/shared/helper/form-helper';

@Component({
  selector: 'tr-card-create',
  imports: [ReactiveFormsModule, FormsModule, FormField, AutofocusDirective],
  templateUrl: './card-create.html',
  styleUrl: './card-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCreate {
  readonly handleCreateCard = output<string>();
  readonly titleModel = signal({ title: '', newElement: false });
  readonly titleForm = getTitleForm(this.titleModel);
  @ViewChild('titleInput') private readonly titleInput!: ElementRef<HTMLTextAreaElement>;

  private setDefault() {
    this.titleModel.update((model) => ({ ...model, title: '', newElement: false }));
    this.titleForm().reset();
  }

  handleClickAddCard() {
    this.titleModel.update((model) => ({ ...model, newElement: true }));
  }

  handleClickCloseCreateCard() {
    this.setDefault();
  }

  handleClickAcceptCreateCard() {
    if (this.titleForm.title().valid()) {
      this.handleCreateCard.emit(this.titleForm.title().value());
    }
    this.setDefault();
  }

  handleEscape(event: Event) {
    event.stopPropagation();
    this.setDefault();
  }

  handleBlurTitle(e: FocusEvent) {
    const eventTarget = e.relatedTarget as HTMLElement;
    if (eventTarget === null) {
      this.titleInput.nativeElement.focus();
    } else if (!eventTarget.classList.contains('card-input')) {
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
