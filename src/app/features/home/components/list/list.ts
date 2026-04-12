import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { ICardCreate, ICardsUpdate } from '@app/shared/interfaces';
import { FormsModule } from '@angular/forms';
import { Card, CardCreate } from '@app/features/home/components';
import { FormField } from '@angular/forms/signals';
import { BoardService } from '@app/features/home/services/board.service';
import { finalize, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getTitleForm } from '@app/shared/helper/form-helper';
import { drawRoundedRect } from '@app/shared/helper/canvas.helper';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tr-list',
  imports: [FormsModule, CardCreate, FormField, RouterLink, RouterOutlet, Card],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List implements OnInit {
  @ViewChildren('cardElement') cardElements!: QueryList<ElementRef<HTMLLIElement>>;

  private readonly _destroy$ = inject(DestroyRef);
  private readonly boardService = inject(BoardService);
  private readonly boardId = computed(() => this.boardService.board()?.id);
  readonly listId = input.required<number>();
  readonly handleRemoteList = output<number>();
  readonly titleModel = signal({ title: '', titleReadonly: true });
  readonly titleForm = getTitleForm(this.titleModel);
  listSlot = computed(() =>
    this.boardService.board()?.lists?.find((list) => list.id === this.listId()),
  );

  constructor() {
    effect(() => {
      if (this.boardService.listUpdatedId() === this.listId()) {
        this.boardService.clearListUpdatedId();
      }
    });
  }

  ngOnInit() {
    this.titleModel.update((model) => ({ ...model, title: this.listSlot()?.title ?? '' }));
  }

  handleClickRemoveList() {
    this.handleRemoteList.emit(this.listId());
  }

  handleTitleClick() {
    this.titleModel.update((model) => ({ ...model, titleReadonly: false }));
  }

  handleTitleBlur(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (this.titleForm.title().invalid()) {
      this.titleModel.update((model) => ({
        ...model,
        title: this.listSlot()?.title ?? '',
        titleReadonly: true,
      }));
      this.titleForm().reset();
      return;
    }
    const boardId = this.boardId();
    if (!boardId) {
      console.log('boardId is undefined');
      return;
    }
    this.titleModel.update((model) => ({ ...model, titleReadonly: true }));
    if (value.trim() !== this.listSlot()?.title.trim()) {
      this.boardService
        .updateListById(boardId, this.listId(), { title: value.trim() })
        .pipe(
          tap(() => {
            this.titleModel.update((model) => ({ ...model, title: value.trim() }));
            this.titleForm().reset();
          }),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleCreateCard(title: string) {
    const boardId = this.boardId();
    if (!boardId) {
      console.warn('boardId is undefined');
      return;
    }
    const listSlot = this.listSlot();
    if (!listSlot) {
      console.warn('list is undefined');
      return;
    }
    const newCard: ICardCreate = {
      title,
      list_id: listSlot.id,
      position:
        Math.max(0, ...listSlot.cardSlots.filter((s) => !!s.card).map((s) => s.card!.position)) + 1,
    };
    this.boardService
      .createCard(boardId, newCard)
      .pipe(takeUntilDestroyed(this._destroy$))
      .subscribe();
  }

  handleDragStart(e: DragEvent) {
    e.stopPropagation();
    const target = e.currentTarget as HTMLLIElement;
    const cardId = target.dataset['id'];
    this.boardService.setCardDragged(cardId ? +cardId : undefined, this.listId());

    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.setData('card_id', cardId ?? '');
    e.dataTransfer.setData('source_list_id', this.listId().toString());
    e.dataTransfer.effectAllowed = 'move';

    const rect = target.getBoundingClientRect();

    const cardSlot = this.listSlot()?.cardSlots?.find((s) => s.card?.id === +(cardId ?? 0));
    const text = cardSlot?.card?.title ?? '';

    const padding = 40;
    const canvasWidth = rect.width + padding * 2;
    const canvasHeight = rect.height + padding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((3 * Math.PI) / 180);
      ctx.scale(1.02, 1.02);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 6;

      ctx.fillStyle = '#3b3b3b';
      const x = -rect.width / 2;
      const y = -rect.height / 2;
      const w = rect.width;
      const h = rect.height;
      drawRoundedRect(ctx, x, y, w, h, 5);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      if (text) {
        ctx.fillStyle = 'white';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, -rect.width / 2 + 12, 0);
      }

      ctx.restore();

      canvas.style.position = 'fixed';
      canvas.style.top = '-9999px';
      document.body.appendChild(canvas);

      e.dataTransfer.setDragImage(canvas, canvasWidth / 2, canvasHeight / 2);

      setTimeout(() => {
        canvas.remove();
      }, 100);
    }

    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
  }

  handleDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLLIElement;
    target.classList.remove('dragging');
    this.boardService.setCardDragged(undefined, undefined);
  }

  handleDragOver(e: DragEvent) {
    if (!e.dataTransfer?.types?.includes('card_id')) {
      return;
    }
    e.preventDefault();

    const listSlot = this.listSlot();
    if (!listSlot) return;

    const elements = this.cardElements.toArray();

    const targetIndex = elements.findIndex((el) => {
      const rect = el.nativeElement.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });

    const actualCards = listSlot.cardSlots
      .filter((s) => !!s.card)
      .sort((a, b) => (a.card?.position ?? 0) - (b.card?.position ?? 0));

    let targetPosition: number;
    if (targetIndex === -1) {
      targetPosition = (actualCards.at(-1)?.card?.position ?? 0) + 1;
    } else {
      targetPosition = actualCards[targetIndex]?.card?.position ?? 1;
    }

    this.boardService.showPlaceholderSlot(targetPosition, listSlot);
  }

  handleDragLeave(e: DragEvent) {
    if (!e.dataTransfer?.types?.includes('card_id')) return;
    const list = (e.currentTarget as HTMLDivElement).children[0];
    const relatedTarget = e.relatedTarget as HTMLDivElement;
    if (list.contains(relatedTarget)) {
      return;
    }
    const listSlot = this.listSlot();
    if (listSlot) {
      this.boardService.hidePlaceholderSlot(listSlot);
    }
    this.boardService.hideCardDragged();
  }

  handleDrop(e: DragEvent) {
    e.preventDefault();
    const draggedCardId = e.dataTransfer?.getData('card_id');
    const sourceListId = e.dataTransfer?.getData('source_list_id');
    const listSlot = this.listSlot();
    const boardId = this.boardId();

    if (!draggedCardId || !sourceListId || !boardId || !listSlot) {
      return;
    }

    // Abort if no visible placeholder — user dragged away without valid drop target
    const placeholder = listSlot.cardSlots.find((s) => !s.card && s.view);
    if (!placeholder) {
      return;
    }

    const placeholderPosition = placeholder.position;

    // Other cards in target list sorted by display position (positions shifted by showPlaceholderSlot)
    const otherCards = listSlot.cardSlots
      .filter((s) => !!s.card && s.card.id !== +draggedCardId)
      .sort((a, b) => a.position - b.position);

    // Dragged card goes after all other cards that are before the placeholder
    const insertIndex = otherCards.filter((s) => s.position < placeholderPosition).length;
    const draggedNewPos = insertIndex + 1;

    const data: ICardsUpdate[] = [
      { id: +draggedCardId, position: draggedNewPos, list_id: listSlot.id },
    ];

    otherCards.forEach((slot, i) => {
      const newPos = i < insertIndex ? i + 1 : i + 2;
      if (newPos !== slot.card!.position) {
        data.push({ id: slot.card!.id, position: newPos, list_id: listSlot.id });
      }
    });

    // For cross-list drag: renumber remaining cards in the source list
    if (+sourceListId !== listSlot.id) {
      const sourceList = this.boardService.board()?.lists?.find((l) => l.id === +sourceListId);
      if (sourceList) {
        sourceList.cardSlots
          .filter((s) => !!s.card && s.card.id !== +draggedCardId)
          .sort((a, b) => a.card!.position - b.card!.position)
          .forEach((slot, i) => {
            if (i + 1 !== slot.card!.position) {
              data.push({ id: slot.card!.id, position: i + 1, list_id: sourceList.id });
            }
          });
      }
    }
    let succeeded = false;
    this.boardService
      .updateGroupCards(boardId, data)
      .pipe(
        tap(() => {
          succeeded = true;
        }),
        takeUntilDestroyed(this._destroy$),
        finalize(() => {
          if (!succeeded) this.boardService.hidePlaceholderSlot(listSlot);
          this.boardService.setCardDragged(undefined, undefined);
        }),
      )
      .subscribe();
  }
}
