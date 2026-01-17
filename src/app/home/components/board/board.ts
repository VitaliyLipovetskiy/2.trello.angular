import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { IBoard } from '@app/common/interfaces';
import { List } from '../list/list';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'tr-board',
  imports: [List, RouterLink],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Board implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  board?: IBoard;

  ngOnInit() {
    this.initBoard();
  }

  private initBoard(): void {
    this.activatedRoute.data.subscribe(({ board }) => {
      this.board = board;
    });
  }
}
