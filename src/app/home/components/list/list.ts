import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ICard } from '../../../common/interfaces';

@Component({
  selector: 'tr-list',
  imports: [],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List {
  @Input() title = '';
  @Input() cards: ICard[] = [];
}
