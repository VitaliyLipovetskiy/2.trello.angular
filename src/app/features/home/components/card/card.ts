import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
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
  readonly cardId = input<number>();
  readonly cardTitle = input<string>();

  private readonly _ = effect(() => {
    if (this.boardService.cardUpdatedId() === this.cardId()) {
      this.boardService.clearCardUpdatedId();
    }
  });
}
