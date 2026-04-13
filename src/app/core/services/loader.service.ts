import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly _activeRequests = signal(0);
  readonly isLoading = computed(() => this._activeRequests() > 0);

  show() {
    this._activeRequests.update((n) => n + 1);
  }

  hide() {
    this._activeRequests.update((n) => Math.max(0, n - 1));
  }
}
