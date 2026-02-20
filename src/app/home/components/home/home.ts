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
    this.boardsService.createBoard(title).subscribe(({ result, id }) => {
      if (result === 'Created') {
        this.boards?.push({ id, title });
        this.cdRef.markForCheck();
      }
    });
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
    this.boardsService.removeBoardById(boardId).subscribe(({ result }) => {
      if (result === 'Deleted') {
        this.boards = this.boards?.filter((board) => board.id !== boardId);
        this.cdRef.markForCheck();
      }
    });
  }
}
