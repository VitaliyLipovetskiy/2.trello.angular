import { Injectable, signal } from '@angular/core';

interface ConfirmState {
  message: string;
  resolve: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  private readonly _state = signal<ConfirmState | null>(null);
  readonly state = this._state.asReadonly();

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this._state.set({ message, resolve });
    });
  }

  accept() {
    this._state()?.resolve(true);
    this._state.set(null);
  }

  cancel() {
    this._state()?.resolve(false);
    this._state.set(null);
  }
}
