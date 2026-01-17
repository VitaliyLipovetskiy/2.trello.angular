import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { IBoard } from '@app/common/interfaces';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'tr-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Home implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  boards?: IBoard[];

  ngOnInit() {
    this.initBoard();
  }

  private initBoard(): void {
    this.activatedRoute.data.subscribe(({ boards }) => {
      this.boards = boards;
    });
  }
}
