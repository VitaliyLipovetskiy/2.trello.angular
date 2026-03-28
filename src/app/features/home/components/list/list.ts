import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getTitleForm } from '@app/shared/helper/form-helper';
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
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly boardId = computed(() => this.boardService.board()?.id)();
  readonly listId = input.required<number>();
  readonly handleRemoteList = output<number>();
  readonly titleModel = signal({ title: '', titleReadonly: true });
  readonly titleForm = getTitleForm(this.titleModel);
  listSlot = computed(() =>
    this.boardService.board()?.lists?.find((list) => list.id === this.listId()),
  );

  ngOnInit() {
    this.titleModel.set({ ...this.titleModel(), title: this.listSlot()?.title || '' });
  }

  private readonly _ = effect(() => {
    if (this.boardService.listUpdatedId() === this.listId()) {
      this.cdRef.markForCheck();
      this.boardService.clearListUpdatedId();
    }
  });

  handleClickRemoveList() {
    this.handleRemoteList.emit(this.listId());
  }

  handleTitleClick() {
    this.titleModel.set({ ...this.titleModel(), titleReadonly: false });
  }

  handleTitleBlur(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (this.titleForm.title().invalid()) {
      this.titleModel.set({
        ...this.titleModel(),
        title: this.listSlot()?.title || '',
        titleReadonly: true,
      });
      this.titleForm().reset();
      return;
    }
    if (!this.boardId) {
      console.log('boardId is undefined');
      return;
    }
    this.titleModel.set({ ...this.titleModel(), titleReadonly: true });
    if (value.trim() !== this.listSlot()?.title.trim()) {
      this.boardService
        .updateListById(this.boardId, this.listId(), { title: value.trim() })
        .pipe(
          tap(() => {
            this.titleModel.set({ ...this.titleModel(), title: value.trim() });
            this.titleForm().reset();
          }),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleCreateCard(title: string) {
    if (!this.boardId) {
      console.log('boardId is undefined');
      return;
    }
    const listSlot = this.listSlot();
    if (!listSlot) {
      console.log('list is undefined');
      return;
    }
    const newCard: ICardCreate = {
      title,
      list_id: listSlot.id,
      position: listSlot.cardSlots?.map((c) => c.position).reduce((a, b) => Math.max(a, b), 0) + 1,
    };
    this.boardService
      .createCard(this.boardId, newCard)
      .pipe(
        tap(() => this.cdRef.markForCheck()),
        takeUntilDestroyed(this._destroy$),
      )
      .subscribe();
  }

  handleDragStart(e: DragEvent) {
    const target = e.currentTarget as HTMLLIElement;
    const cardId = target.dataset['id'];
    this.boardService.setCardDragged(cardId || undefined, this.listId());

    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.setData('card_id', cardId || '');
    e.dataTransfer.setData('list_id', this.listId().toString());
    e.dataTransfer.effectAllowed = 'move';

    const rect = target.getBoundingClientRect();

    const cardSlot = this.listSlot()?.cardSlots?.find((s) => s.card?.id === +(cardId || 0));
    const text = cardSlot?.card?.title || '';

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
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
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
      .sort((a, b) => (a.card?.position || 0) - (b.card?.position || 0));

    let targetPosition: number;
    if (targetIndex === -1) {
      targetPosition = (actualCards.at(-1)?.card?.position || 0) + 1;
    } else {
      targetPosition = actualCards[targetIndex]?.card?.position || 1;
    }

    this.boardService.showPlaceholderSlot(targetPosition, listSlot);
  }

  handleDragLeave(e: DragEvent) {
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
    const sourceListId = e.dataTransfer?.getData('list_id');
    const listSlot = this.listSlot();

    if (!draggedCardId || !sourceListId || !this.boardId || !listSlot) {
      return;
    }

    const placeholderHidden = listSlot.cardSlots.some((slot) => !slot.card && !slot.view);
    if (placeholderHidden) {
      return;
    }

    const data: ICardsUpdate[] = listSlot.cardSlots
      .filter((slot) => slot.card?.id !== +draggedCardId)
      .map((slot, index) => ({
        card: slot.card,
        position: index + 1,
      }))
      .filter((slot) => slot.position !== slot.card?.position)
      .map((slot) => ({
        id: slot.card?.id || +draggedCardId,
        position: slot.position,
        list_id: listSlot.id,
      }));

    if (+sourceListId !== listSlot.id) {
      const sourceList = this.boardService.board()?.lists?.find((l) => l.id === +sourceListId);
      if (sourceList) {
        // Беремо всі картки вихідного списку, крім тієї, що перетягнули
        const sourceUpdates = sourceList.cardSlots
          .filter((slot) => !!slot.card && slot.card.id !== +draggedCardId)
          .map((slot, index) => ({
            card: slot.card,
            position: index + 1,
          }))
          .filter((slot) => slot.position !== slot.card!.position)
          .map((slot) => ({
            id: slot.card!.id,
            position: slot.position,
            list_id: sourceList.id,
          }));
        data.push(...sourceUpdates);
      }
    }

    this.boardService
      .updateGroupCards(this.boardId, data)
      .pipe(
        tap(() => this.cdRef.markForCheck()),
        takeUntilDestroyed(this._destroy$),
      )
      .subscribe();

    this.boardService.hidePlaceholderSlot(listSlot);
    this.boardService.setCardDragged(undefined, undefined);
  }
}
