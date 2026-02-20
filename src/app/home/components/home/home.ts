import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { IBoard } from '@app/common/interfaces';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BoardCreate } from '@app/home/components';
import { BoardsService } from '@app/home/services/boards-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tr-home',
  imports: [RouterLink, BoardCreate],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly boardsService = inject(BoardsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly toastr = inject(ToastrService);
  boards?: IBoard[];
  boardModal = false;

  ngOnInit() {
    this.initBoard();
  }

  private initBoard(): void {
    this.activatedRoute.data.subscribe(({ boards }) => {
      this.boards = boards;
    });
  }

  handleCreateBoard(title: string) {
    try {
      this.boardsService.createBoard(title).subscribe(({ result, id }) => {
        if (result === 'Created') {
          this.boards?.push({ id, title });
          this.cdRef.markForCheck();
          this.toastr.success('Board created successfully!', 'Success!');
        } else {
          this.toastr.error('Board not created!', 'Error!');
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

  protected handleClickAddBoard() {
    this.boardModal = true;
  }

  handleModalClickClose() {
    this.boardModal = false;
  }

  handleClickRemoveBoard(e: MouseEvent, boardId: number) {
    e.preventDefault();
    e.stopPropagation();
    try {
      this.boardsService.removeBoardById(boardId).subscribe(({ result }) => {
        if (result === 'Deleted') {
          this.boards = this.boards?.filter((board) => board.id !== boardId);
          this.cdRef.markForCheck();
          this.toastr.success('Board removed successfully!', 'Success!');
        } else {
          this.toastr.error('Board not removed!', 'Error!');
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
