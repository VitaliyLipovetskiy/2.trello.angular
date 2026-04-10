import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { IBoardUpdate, IListCreate, IListsUpdate } from '@app/shared/interfaces';
import { List } from '../list/list';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListCreate } from '@app/features/home/components';
import { FormField } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoardService } from '@app/features/home/services/board.service';
import { getTitleForm } from '@app/shared/helper/form-helper';
import { drawRoundedRect } from '@app/shared/helper/canvas.helper';
import { ConfirmService } from '@app/shared/services/confirm.service';

@Component({
  selector: 'tr-board',
  imports: [List, RouterLink, FormsModule, ReactiveFormsModule, ListCreate, FormField],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Board implements OnInit {
  @ViewChildren('listElement') listElements!: QueryList<ElementRef<HTMLElement>>;
  private readonly _destroy$ = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly boardService = inject(BoardService);
  private readonly confirmService = inject(ConfirmService);
  private readonly boardId = signal<number>(0);
  readonly board = this.boardService.board;
  readonly titleModel = signal({ title: '', backgroundColor: '', titleReadonly: true });
  readonly titleForm = getTitleForm(this.titleModel);
  readonly listDraggedId = this.boardService.listDraggedId;
  readonly listPlaceholderIndex = this.boardService.listPlaceholderIndex;

  ngOnInit() {
    this.initBoard();
    this.titleForm.title().focusBoundControl();
  }

  private initBoard(): void {
    this.activatedRoute.params.pipe(takeUntilDestroyed(this._destroy$)).subscribe((params) => {
      this.boardId.set(params['boardId']);
    });
    this.activatedRoute.data
      .pipe(
        tap(({ board }) => {
          if (board) {
            this.titleModel.set({
              ...this.titleModel(),
              title: board.title,
              backgroundColor: board.custom?.background,
            });
          }
        }),
        takeUntilDestroyed(this._destroy$),
      )
      .subscribe();
  }

  handleColorChange(e: Event) {
    e.stopPropagation();
    const { value } = e.target as HTMLInputElement;
    if (value !== this.titleModel().backgroundColor) {
      const boardData: IBoardUpdate = {
        title: this.titleForm.title().value(),
        custom: { background: value },
      };
      this.boardService
        .updateBoard(this.boardId(), boardData)
        .pipe(
          tap(() => this.titleModel.set({ ...this.titleModel(), backgroundColor: value })),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleTitleClick() {
    this.titleModel.set({ ...this.titleModel(), titleReadonly: false });
  }

  handleTitleBlur(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (this.titleForm.title().invalid()) {
      this.titleModel.set({
        ...this.titleModel(),
        title: this.board()?.title ?? '',
        titleReadonly: true,
      });
      this.titleForm().reset();
      return;
    }
    this.titleModel.set({ ...this.titleModel(), titleReadonly: true });
    if (value.trim() !== this.board()?.title.trim()) {
      this.boardService
        .updateBoard(this.boardId(), { title: value.trim() })
        .pipe(
          tap(() => this.titleModel.set({ ...this.titleModel(), title: value.trim() })),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  handleCreateList(title: string) {
    const listData: IListCreate = {
      title,
      position: (this.board()?.lists?.length ?? 0) + 1,
    };
    this.boardService
      .createList(this.boardId(), listData)
      .pipe(
        // tap(() => this.cdRef.markForCheck()),
        takeUntilDestroyed(this._destroy$),
      )
      .subscribe();
  }

  async handleRemoteList(listId: number) {
    const title = this.board()?.lists?.find((list) => list.id === listId)?.title;
    if (await this.confirmService.confirm(`Видалити список "${title}"?`)) {
      this.boardService
        .removeListById(this.boardId(), listId)
        .pipe(
          // tap(() => this.cdRef.markForCheck()),
          takeUntilDestroyed(this._destroy$),
        )
        .subscribe();
    }
  }

  get isInvalidTitle() {
    return (
      this.titleForm.title().invalid() &&
      (this.titleForm.title().dirty() || this.titleForm.title().touched())
    );
  }

  handleListDragStart(e: DragEvent, listId: number) {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData('list_id', listId.toString());
    e.dataTransfer.effectAllowed = 'move';
    this.boardService.setListDragged(listId);

    const target = e.currentTarget as HTMLElement;
    const listInner = target.querySelector('.list') as HTMLElement;
    const rect = (listInner ?? target).getBoundingClientRect();

    const list = this.board()?.lists?.find((l) => l.id === listId);
    const title = list?.title ?? '';
    const cards = list?.cardSlots.filter((s) => !!s.card).map((s) => s.card!.title) ?? [];

    const padding = 40;
    const listW = rect.width;
    const listH = rect.height;
    const canvasWidth = listW + padding * 2;
    const canvasHeight = listH + padding * 2;

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

      // List background
      const x = -listW / 2;
      const y = -listH / 2;
      ctx.fillStyle = '#222';
      drawRoundedRect(ctx, x, y, listW, listH, 10);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, x + 12, y + 22);

      // Cards — беремо реальні позиції та висоти з DOM
      const cardEls = Array.from(
        target.querySelectorAll<HTMLElement>('.card-wrapper[data-type="card"]'),
      );
      const cardX = x + 5;
      const cardW = listW - 10;
      const cardRadius = 5;

      cardEls.forEach((cardEl, i) => {
        const cardRect = cardEl.getBoundingClientRect();
        const cardRelY = cardRect.top - rect.top;
        const cardH = cardRect.height;
        const cardY = y + cardRelY;

        if (cardY + cardH > y + listH - 5) return;

        ctx.fillStyle = '#3b3b3b';
        drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(cards[i] ?? '', cardX + 10, cardY + cardH / 2, cardW - 20);
      });

      // "+ Додати картку" button — використовуємо реальну позицію з DOM
      const addBtnEl = target.querySelector('.card-add-btn') as HTMLElement;
      if (addBtnEl) {
        const btnRect = addBtnEl.getBoundingClientRect();
        const btnRelY = btnRect.top - rect.top;
        ctx.fillStyle = '#525dce';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('+ Додати картку', cardX + 10, y + btnRelY + btnRect.height / 2);
      }

      ctx.restore();

      canvas.style.position = 'fixed';
      canvas.style.top = '-9999px';
      document.body.appendChild(canvas);

      e.dataTransfer.setDragImage(
        canvas,
        e.clientX - rect.left + padding,
        e.clientY - rect.top + padding,
      );

      setTimeout(() => canvas.remove(), 100);
    }

    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
  }

  handleListDragEnd(e: DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove('dragging');
    this.boardService.setListDragged(undefined);
    this.boardService.setListPlaceholderIndex(undefined);
  }

  handleListDragOver(e: DragEvent) {
    if (!e.dataTransfer?.types?.includes('list_id')) return;
    e.preventDefault();

    const elements = this.listElements.toArray();
    const targetIndex = elements.findIndex((el) => {
      const rect = el.nativeElement.getBoundingClientRect();
      return e.clientX < rect.left + rect.width / 2;
    });

    const index = targetIndex === -1 ? elements.length : targetIndex;

    const draggedIndex = (this.board()?.lists ?? []).findIndex(
      (l) => l.id === this.listDraggedId(),
    );
    if (index === draggedIndex || index === draggedIndex + 1) {
      this.boardService.setListPlaceholderIndex(undefined);
      return;
    }

    this.boardService.setListPlaceholderIndex(index);
  }

  handleListDragLeave(e: DragEvent) {
    if (!e.dataTransfer?.types?.includes('list_id')) return;
    const ol = e.currentTarget as HTMLElement;
    if (ol.contains(e.relatedTarget as Node)) return;
    this.boardService.setListPlaceholderIndex(undefined);
  }

  handleListDrop(e: DragEvent) {
    e.preventDefault();
    const draggedListId = +(e.dataTransfer?.getData('list_id') ?? 0);
    const placeholderIndex = this.listPlaceholderIndex();
    const lists = this.board()?.lists ?? [];
    const boardId = this.boardId();

    this.boardService.setListPlaceholderIndex(undefined);
    this.boardService.setListDragged(undefined);

    if (!draggedListId || placeholderIndex === undefined || !boardId) return;

    const draggedIndex = lists.findIndex((l) => l.id === draggedListId);
    if (draggedIndex === -1) return;

    const insertIndex = draggedIndex < placeholderIndex ? placeholderIndex - 1 : placeholderIndex;

    const reordered = lists.filter((l) => l.id !== draggedListId);
    reordered.splice(insertIndex, 0, lists[draggedIndex]);

    const updates: IListsUpdate[] = reordered
      .map((l, i) => ({ id: l.id, position: i + 1 }))
      .filter((u) => u.position !== lists.find((l) => l.id === u.id)?.position);

    if (updates.length > 0) {
      this.boardService
        .updateGroupLists(boardId, updates)
        .pipe(takeUntilDestroyed(this._destroy$))
        .subscribe();
    }
  }
}
