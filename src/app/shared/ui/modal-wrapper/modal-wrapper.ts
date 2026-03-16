import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal-wrapper',
  imports: [CommonModule],
  templateUrl: './modal-wrapper.html',
  styleUrl: './modal-wrapper.scss',
})

export class ModalWrapper {
  modalSize = input<'normal' | 'medium' | 'small'>('normal');
  contentPadding = input<boolean>(true);
  showCloseButton = input<boolean>(true);
  @Output() close = new EventEmitter<void>();

  /**
   * Handles the internal close logic and triggers the 'close' output event.
   * Call this method from the template (e.g., on a backdrop click).
   */
  onClose() {
    this.close.emit();
  }
}
