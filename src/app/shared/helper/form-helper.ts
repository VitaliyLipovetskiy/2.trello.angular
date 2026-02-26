import { form, hidden, pattern, readonly, required } from '@angular/forms/signals';
import { WritableSignal } from '@angular/core';

interface ITitleModel {
  title: string;
  titleReadonly?: boolean;
  newElement?: boolean;
}

export const getTitleForm = (model: WritableSignal<ITitleModel>) =>
  form(model, (schemaPath) => {
    required(schemaPath.title, { message: 'Поле не може бути порожнім' });
    pattern(schemaPath.title, /^[a-zа-яіїєґ0-9-._\s]+$/i, {
      message: 'Поле може містити лише літери, 0-9, пробіли, крапки, "-" і "_"',
    });
    readonly(schemaPath.title, () => model().titleReadonly || false);
    hidden(schemaPath.title, () => !(model().newElement || true));
  });
