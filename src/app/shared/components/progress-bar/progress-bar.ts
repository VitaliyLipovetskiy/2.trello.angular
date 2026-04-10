import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from '@app/core/services/loader.service';

@Component({
  selector: 'tr-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBar {
  protected readonly loaderService = inject(LoaderService);
}
