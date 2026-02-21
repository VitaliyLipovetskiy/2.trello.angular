import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { IBoard, IBoardUpdate, IList, IListCreate } from '@app/common/interfaces';
import { List } from '../list/list';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BoardsService } from '@app/home/services/boards-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListCreate } from '@app/home/components';
import { form, FormField, pattern, readonly, required } from '@angular/forms/signals';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tr-board',
  imports: [List, RouterLink, FormsModule, ReactiveFormsModule, ListCreate, FormField],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Board implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly boardsService = inject(BoardsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly toastr = inject(ToastrService);
  boardId = signal<number>(0);
  board?: IBoard;
  titleModel = signal({ title: '', backgroundColor: '', titleReadonly: true });
  titleForm = form(this.titleModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Поле не може бути порожнім' });
    pattern(schemaPath.title, /^[a-zа-яіїєґ0-9-._\s]+$/i, {
      message: 'Поле може містити лише літери, 0-9, пробіли, крапки, "-" і "_"',
    });
    readonly(schemaPath.title, () => this.titleModel().titleReadonly);
  });

  ngOnInit() {
    this.initBoard();
    this.titleForm.title().focusBoundControl();
  }

  private initBoard(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.boardId.set(params['id']);
    });
    this.activatedRoute.data.subscribe(({ board }) => {
      this.board = board;
      this.titleModel.set({
        ...this.titleModel(),
        title: board.title,
        backgroundColor: board.custom?.background,
      });
    });
  }

  private preventDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleColorChange(e: Event) {
    e.stopPropagation();
    const { value } = e.target as HTMLInputElement;
    if (value !== this.titleModel().backgroundColor) {
      const boardData: IBoardUpdate = {
        title: this.titleForm.title().value(),
        custom: { background: value },
      };
      try {
        this.boardsService.updateBoard(this.boardId(), boardData).subscribe(({ result }) => {
          if (result === 'Updated') {
            this.titleModel.set({ ...this.titleModel(), backgroundColor: value });
            this.toastr.success('Board updated successfully!', 'Success!');
          } else {
            this.toastr.error('Board not updated!', 'Error!');
          }
        });
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          this.toastr.error(error.message, 'Error!');
        } else {
          throw error;
        }
      }
    }
  }

  handleTitleClick(e: Event) {
    this.preventDefault(e);
    this.titleModel.set({ ...this.titleModel(), titleReadonly: false });
  }

  handleTitleBlur(e: Event) {
    this.preventDefault(e);
    const { value } = e.target as HTMLInputElement;
    if (this.titleForm.title().invalid()) {
      this.titleModel.set({
        ...this.titleModel(),
        title: this.board?.title || '',
        titleReadonly: true,
      });
      this.titleForm().reset();
      return;
    }
    this.titleModel.set({ ...this.titleModel(), titleReadonly: true });
    if (value.trim() !== this.board?.title.trim()) {
      const boardData: IBoardUpdate = {
        title: value.trim(),
      };
      try {
        this.boardsService.updateBoard(this.boardId(), boardData).subscribe(({ result }) => {
          if (result === 'Updated') {
            this.titleModel.set({ ...this.titleModel(), title: value.trim() });
            this.toastr.success('Board updated successfully!', 'Success!');
          } else {
            this.toastr.error('Board not updated!', 'Error!');
          }
        });
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          this.toastr.error(error.message, 'Error!');
        } else {
          throw error;
        }
      }
      this.titleForm().reset();
    }
  }

  handleCreateList(title: string) {
    const listData: IListCreate = {
      title,
      position: (this.board?.lists?.length || 0) + 1,
    };
    try {
      this.boardsService.createList(this.boardId(), listData).subscribe(({ result, id }) => {
        if (result === 'Created') {
          const list: IList = { id, title, position: listData.position, cards: [] };
          this.board?.lists?.push(list);
          this.cdRef.markForCheck();
          this.toastr.success('List created successfully!', 'Success!');
        } else {
          this.toastr.error('List not created!', 'Error!');
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        this.toastr.error(error.message, 'Error!');
      } else {
        throw error;
      }
    }
    this.titleForm().reset();
  }

  handleRemoteList(listId: number) {
    try {
      this.boardsService.removeListById(this.boardId(), listId).subscribe(({ result }) => {
        if (result === 'Deleted') {
          const lists = this.board?.lists?.filter((list) => list.id !== listId) || [];
          this.board?.lists?.splice(0, this.board?.lists?.length);
          this.board?.lists?.push(...lists);
          this.cdRef.markForCheck();
          this.toastr.success('List deleted successfully!', 'Success!');
        } else {
          this.toastr.error('List not deleted!', 'Error!');
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        this.toastr.error(error.message, 'Error!');
      } else {
        throw error;
      }
    }
  }
}
