import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { ICard, IList } from '@app/shared/interfaces';
import { BoardService } from '@app/features/home/services/board.service';

@Component({
  selector: 'tr-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card implements OnInit {
  private readonly boardService = inject(BoardService);
  private readonly cdRef = inject(ChangeDetectorRef);
  readonly cardId = input.required<number>();
  private list?: IList;
  card?: ICard;
  readonly handleRemoteCard = output<number>();

  ngOnInit() {
    this.list = this.boardService
      .board()
      ?.lists?.find((list) => list.cards?.some((card) => card.id === this.cardId()));
    this.card = this.list?.cards?.find((card) => card.id === this.cardId());
  }

  private readonly _ = effect(() => {
    if (this.boardService.cardUpdatedId() === this.cardId()) {
      this.card = this.boardService.card();
      this.cdRef.markForCheck();
      this.boardService.clearCardUpdatedId();
    }
    if (this.boardService.list()?.id === this.list?.id) {
      this.list = this.boardService.list();
    }
  });

  handleClickRemoveCard(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.handleRemoteCard.emit(this.cardId());
  }

  handleTitleClick() {
    if (this.card && this.list) {
      this.boardService.setCard(this.card, this.list);
    }
  }
}
