import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '@app/shared/services/confirm.service';

@Component({
  selector: 'tr-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModal {
  readonly confirmService = inject(ConfirmService);
}
