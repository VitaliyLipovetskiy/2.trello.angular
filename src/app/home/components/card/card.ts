import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tr-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Card {
  title = input.required<string>();
}
