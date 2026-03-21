import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
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
  readonly cardTitle = computed(
    () =>
      this.boardService
        .board()
        ?.lists?.find((list) =>
          list.cardSlots?.some((cardSlot) => cardSlot.card?.id === this.cardId()),
        )
        ?.cardSlots?.find((cardSlot) => cardSlot.card?.id === this.cardId())?.card?.title,
  );
  readonly handleRemoteCard = output<number>();

  private readonly _ = effect(() => {
    if (this.boardService.cardUpdatedId() === this.cardId()) {
      this.cdRef.markForCheck();
      this.boardService.clearCardUpdatedId();
    }
  });

  // handleClickRemoveCard(e: MouseEvent) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   this.handleRemoteCard.emit(this.cardId());
  // }

  // handleTitleClick() {
  //   if (this.cardSlot && this.listSlot) {
  //     this.boardService.setCard(this.cardSlot(), this.listSlot());
  //   }
  // }
}
