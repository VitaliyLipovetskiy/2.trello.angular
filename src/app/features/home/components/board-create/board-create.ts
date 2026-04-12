import { ChangeDetectionStrategy, Component, OnInit, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '@app/shared/directives/autofocus.directive';
import { FormField } from '@angular/forms/signals';
import { getTitleForm } from '@app/shared/helper/form-helper';
import { EscapeListenerDirective } from '@app/shared/directives/escape-listener.directive';

@Component({
  selector: 'tr-board-create',
  imports: [ReactiveFormsModule, AutofocusDirective, FormField, EscapeListenerDirective],
  templateUrl: './board-create.html',
  styleUrl: './board-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardCreate implements OnInit {
  readonly handleClose = output<void>();
  readonly handleCreateBoard = output<string>();
  readonly titleModel = signal({ title: '' });
  readonly titleForm = getTitleForm(this.titleModel);

  ngOnInit() {
    this.titleForm.title().focusBoundControl();
  }

  handleAcceptCreateBoard(e: Event) {
    e.preventDefault();
    if (this.titleForm.title().valid()) {
      this.handleCreateBoard.emit(this.titleForm.title().value());
    }
  }

  handleClickClose(e: Event) {
    e.preventDefault();
    this.handleClose.emit();
  }

  handleClickOutside(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.className.includes('modals_wrapper')) {
      this.handleClose.emit();
    }
  }

  get isDisabledCreateBtn() {
    return (
      this.titleForm.title().invalid() ||
      !(this.titleForm.title().dirty() || this.titleForm.title().touched())
    );
  }

  get isInvalidTitle() {
    return (
      this.titleForm.title().invalid() &&
      (this.titleForm.title().dirty() || this.titleForm.title().touched())
    );
  }
}
