import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Navi } from './navi/navi';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, Navi, RouterOutlet,],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  isNavCollapsed = signal<boolean>(false);

  /**
   * Applies collapse state emitted by the navigation.
   * @param value Current collapsed state.
   * @returns Nothing.
   */
  onNavCollapsedChange(value: boolean) {
    this.isNavCollapsed.set(value);
  }
}
