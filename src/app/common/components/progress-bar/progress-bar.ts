import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from '@app/home/services/loader.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tr-progress-bar',
  imports: [AsyncPipe],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBar {
  protected readonly loaderService = inject(LoaderService);
  loading$ = this.loaderService.isLoading;
}
