import { Directive, HostListener, ElementRef } from '@angular/core';

/**
 * Directive that converts vertical mouse-wheel scrolling into horizontal scrolling.
 * Active only on viewports narrower than 992 px.
 *
 * @example
 * <div horizontalScroll>…</div>
 */
@Directive({
  selector: '[horizontalScroll]'
})
export class HorizontalScrollDirective {

  constructor(private el: ElementRef<HTMLElement>) { }

  /**
   * Intercepts vertical wheel events and translates them into horizontal scroll.
   * Does nothing on large screens (≥ 992 px).
   *
   * @param event - The native wheel event.
   */
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {

    if (window.innerWidth >= 992) return;

    if (event.deltaY !== 0) {
      event.preventDefault();
      this.el.nativeElement.scrollLeft += event.deltaY;
    }
  }
}
