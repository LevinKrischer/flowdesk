import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})

export class Card {
  @Input() variant: 'light' | 'dark' = 'light';
}
