import { Component, Input } from '@angular/core';

/**
 * A flexible container component for grouping related content.
 * Designed to work with ng-content to wrap any content or components.
 * Note: Currently not used in the application.
 */
@Component({
  selector: 'ui-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  /**
   * The color theme of the card.
   * - `light`: Standard background (usually white or light gray).
   * - `dark`: High-contrast background for dark mode or specific UI sections.
   * @default 'light'
   */
  @Input() variant: 'light' | 'dark' = 'light';
}
