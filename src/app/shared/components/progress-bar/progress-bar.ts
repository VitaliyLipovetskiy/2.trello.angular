import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from '@app/core/services/loader.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tr-progress-bar',
  imports: [AsyncPipe],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBar {
  private readonly loaderService = inject(LoaderService);
  readonly loading$ = this.loaderService.isLoading;
}
