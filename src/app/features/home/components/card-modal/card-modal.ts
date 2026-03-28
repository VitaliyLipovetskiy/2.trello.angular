import {
  ChangeDetectionStrategy,
  Component,
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
  private readonly boardId = this.boardService.board()?.id;
  private readonly cardId = signal<number>(0);
  private readonly cardModel = signal({ title: '', description: '' });
  readonly list = this.boardService.list;
  readonly card = this.boardService.card;
  readonly cardForm = getCardModalForm(this.cardModel);
  readonly cardModal = this.boardService.cardModal;
  readonly isEditingDescription = signal(false);
  readonly descriptionTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('descriptionTextarea');

  ngOnInit() {
    this.initCard();
  }

  private setCardModel(cardSlot: ICardSlot | undefined) {
    this.cardModel.set({
      title: cardSlot?.card?.title || '',
      description: cardSlot?.card?.description || '',
    });
  }

  private initCard(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.cardId.set(params['cardId']);
      this.boardService.setCardModal(true);
    });
    if (this.card()) {
      this.setCardModel(this.card());
    } else if (this.boardId) {
      this.boardService
        .getCardById(this.boardId, +this.cardId())
        .pipe(
          tap((card) => this.setCardModel(card)),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleModalClose() {
    this.boardService.setCard(this.card(), undefined);
    this.router.navigate(['/board', this.boardId]);
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
        console.log('card is undefined');
        return;
      }
      if (!this.list()) {
        console.log('list is undefined');
        return;
      }
      const cardData: ICardUpdate = {
        title: this.cardModel().title.trim(),
        description: this.cardModel().description.trim(),
        list_id: this.list()!.id,
      };
      if (!this.boardId) {
        console.log('boardId is undefined');
        return;
      }
      this.boardService
        .updateCardById(this.boardId, this.card()!.card!.id, cardData)
        .pipe(takeUntilDestroyed(this._destroy$))
        .subscribe();
    }
  }

  handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.className.includes('modals_wrapper')) {
      this.handleModalClose();
    }
  }

  handleDeleteCard() {
    const title = this.card()?.card?.title;
    if (!this.boardId) {
      console.log('boardId is undefined');
      return;
    }
    const listId = this.list()!.id;
    if (!listId) {
      console.log('list is undefined');
      return;
    }
    if (confirm(`Are you sure to delete ${title}`)) {
      this.boardService
        .removeCardById(this.boardId, listId, this.cardId())
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

  get isInvalidTitle() {
    return (
      this.cardForm.title().invalid() &&
      (this.cardForm.title().dirty() || this.cardForm.title().touched())
    );
  }
}
