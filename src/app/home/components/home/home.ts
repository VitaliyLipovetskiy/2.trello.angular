import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IBoard } from '@app/common/interfaces';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tr-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Home {
  boards: IBoard[] = [
    { id: 1, title: 'покупки', custom: { background: '#b32d2d' } },
    { id: 2, title: 'подготовка к свадьбе' },
    { id: 3, title: 'разработка интернет-магазина', custom: { background: '#2db32d' } },
    { id: 4, title: 'курс по продвижению в соцсетях' },
  ];
}
