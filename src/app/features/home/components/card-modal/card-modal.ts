import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { BoardService } from '@app/features/home/services/board.service';
import { getCardModalForm } from '@app/shared/helper/form-helper';
import { FormField } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { ICardSlot, ICardUpdate } from '@app/shared/interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EscapeListenerDirective } from '@app/shared/directives/escape-listener.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { MarkdownPipe } from '@app/shared/pipes/markdown.pipe';
import { ConfirmService } from '@app/shared/services/confirm.service';

@Component({
  selector: 'tr-card-modal',
  imports: [FormField, FormsModule, EscapeListenerDirective, MarkdownPipe],
  templateUrl: './card-modal.html',
  styleUrl: './card-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardModal implements OnInit {
  private readonly _destroy$ = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  private readonly confirmService = inject(ConfirmService);
  private readonly board = this.boardService.board;
  private readonly cardId = signal<number>(0);
  private readonly cardModel = signal({ title: '', description: '' });
  readonly list = this.boardService.list;
  readonly card = this.boardService.card;
  readonly cardForm = getCardModalForm(this.cardModel);
  readonly cardModal = this.boardService.cardModal;
  readonly isEditingDescription = signal(false);
  readonly descriptionTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('descriptionTextarea');
  readonly isInvalidTitle = computed(
    () =>
      this.cardForm.title().invalid() &&
      (this.cardForm.title().dirty() || this.cardForm.title().touched()),
  );

  ngOnInit() {
    this.initCard();
  }

  private setCardModel(cardSlot: ICardSlot | undefined) {
    this.cardModel.set({
      title: cardSlot?.card?.title ?? '',
      description: cardSlot?.card?.description ?? '',
    });
  }

  private initCard(): void {
    this.activatedRoute.params.pipe(takeUntilDestroyed(this._destroy$)).subscribe((params) => {
      const cardId = +params['cardId'];
      this.cardId.set(cardId);
      this.boardService.setCardModal(true);
      const boardId =
        this.board()?.id ?? +(this.activatedRoute.parent?.snapshot?.params['boardId'] ?? 0);
      if (this.card()) {
        this.setCardModel(this.card());
      } else if (boardId) {
        this.boardService
          .getCardById(boardId, cardId)
          .pipe(
            tap((card) => this.setCardModel(card)),
            takeUntilDestroyed(this._destroy$),
          )
          .subscribe();
      }
    });
  }

  handleModalClose() {
    const boardId = this.board()?.id;
    if (!boardId) {
      console.warn('boardId is undefined');
      return;
    }
    this.boardService.setCard(this.card(), undefined);
    this.router.navigate(['/board', boardId]);
    this.boardService.setCardModal(false);
  }

  handleEscape(event: Event) {
    event.stopPropagation();
    this.setCardModel(this.card());
    this.isEditingDescription.set(false);
    (event.target as HTMLElement).blur();
  }

  handleInputOnBlur() {
    this.isEditingDescription.set(false);
    if (this.cardForm.title().invalid()) {
      this.setCardModel(this.card());
      this.cardForm().reset();
      return;
    }
    if (
      this.cardModel().title.trim() !== this.card()?.card?.title?.trim() ||
      this.cardModel().description.trim() !== this.card()?.card?.description?.trim()
    ) {
      if (!this.card()) {
        console.warn('card is undefined');
        return;
      }
      if (!this.list()) {
        console.warn('list is undefined');
        return;
      }
      const cardData: ICardUpdate = {
        title: this.cardModel().title.trim(),
        description: this.cardModel().description.trim(),
        list_id: this.list()!.id,
      };
      const boardId = this.board()?.id;
      if (!boardId) {
        console.warn('boardId is undefined');
        return;
      }
      this.boardService
        .updateCardById(boardId, this.card()!.card!.id, cardData)
        .pipe(takeUntilDestroyed(this._destroy$))
        .subscribe();
    }
  }

  handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modals_wrapper')) {
      this.handleModalClose();
    }
  }

  async handleDeleteCard() {
    const title = this.card()?.card?.title;
    const boardId = this.board()?.id;
    if (!boardId) {
      console.warn('boardId is undefined');
      return;
    }
    const listId = this.list()?.id;
    if (!listId) {
      console.warn('list is undefined');
      return;
    }
    if (await this.confirmService.confirm(`Видалити картку "${title}"?`)) {
      this.boardService
        .removeCardById(boardId, listId, this.cardId())
        .pipe(
          tap(() => this.handleModalClose()),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  toggleEditDescription() {
    this.isEditingDescription.set(true);
    setTimeout(() => {
      this.descriptionTextarea()?.nativeElement.focus();
    });
  }
}
