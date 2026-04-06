import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})

export class Button {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'urgent'
    | 'medium'
    | 'low'
    | 'fab-primary'
    | 'fab-secondary'
    | 'icon-sm'
    | 'link' = 'primary';
  @Input() bootstrapIcon?: string;
  @Input() iconSize?: string;
  @Input() active = false;
  @Input() disabled = false;
}
