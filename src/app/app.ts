import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tr-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly router = inject(Router);
  isNavigating = computed(() => !!this.router.currentNavigation());
}
