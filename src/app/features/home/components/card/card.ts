import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { BoardService } from '@app/features/home/services/board.service';

@Component({
  selector: 'tr-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  private readonly boardService = inject(BoardService);
  private readonly cdRef = inject(ChangeDetectorRef);
  readonly cardId = input<number>();
  readonly cardTitle = input<string>();

  private readonly _ = effect(() => {
    if (this.boardService.cardUpdatedId() === this.cardId()) {
      this.cdRef.markForCheck();
      this.boardService.clearCardUpdatedId();
    }
  });
}
