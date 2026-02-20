import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '@app/helpers/autofocus.directive';
import { form, FormField, pattern, required } from '@angular/forms/signals';

@Component({
  selector: 'tr-board-create',
  imports: [ReactiveFormsModule, AutofocusDirective, FormField],
  templateUrl: './board-create.html',
  styleUrl: './board-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardCreate implements OnInit {
  private readonly fb = inject(FormBuilder);
  handleClose = output<void>();
  handleCreateBoard = output<string>();
  titleModel = signal({ title: '' });
  titleForm = form(this.titleModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Поле не може бути порожнім' });
    pattern(schemaPath.title, /^[a-zа-яіїєґ0-9-._\s]+$/i, {
      message: 'Поле може містити лише літери, 0-9, пробіли, крапки, "-" і "_"',
    });
  });

  ngOnInit() {
    this.titleForm.title().focusBoundControl();
  }

  handleAcceptCreateBoard(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (this.titleForm.title().valid()) {
      this.handleCreateBoard.emit(this.titleForm.title().value());
    }
    this.titleForm().reset();
    this.handleClose.emit();
  }

  handleClickClose(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.titleForm().reset();
    this.handleClose.emit();
  }
}
