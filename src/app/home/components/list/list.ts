import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ICard } from '../../../common/interfaces';
import { Card } from '../card/card';

@Component({
  selector: 'tr-list',
  imports: [Card],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class List {
  @Input() title = '';
  @Input() cards: ICard[] = [];
}
