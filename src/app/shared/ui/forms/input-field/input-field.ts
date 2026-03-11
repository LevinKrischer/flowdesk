import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isValidName, isValidEmail, isValidPhone } from '../../../../core/utils/validation';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-field.html',
  styleUrls: ['./input-field.scss'],
})
export class InputFieldComponent {
  @Input() type: string | 'text' | 'date' | 'email' | 'tel' | 'password' = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() icon: string | null = null;
  @Input() iconAlt = '';
  @Input() iconClickable = false;
  @Input() error: string | null = null;
  @Input() maxlength: number | null = null;
  @Input() minDate: string | null = null;
  @Input() isRequired: boolean = false;
  @Input() displayLabel: boolean = true;
  @Input() reserveErrorSpace: boolean = false;

  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>();

  @Output() blur = new EventEmitter<void>();
  @Output() inputChange = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<void>();
  @Output() iconClick = new EventEmitter<void>();

  /**
   * Handles input events, emitting the updated value and the raw event.
   *
   * @param event - The native input event.
   */
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.modelChange.emit(value);
    this.inputChange.emit(event);
  }

  /** Emits the iconClick event if the icon is configured as clickable. */
  onIconClick() {
    if (!this.iconClickable) return;
    this.iconClick.emit();
  }

  /**
   * Prevents default behavior on icon pointer-down to avoid stealing focus from the input.
   *
   * @param event - The pointer-down mouse event.
   */
  onIconPointerDown(event: MouseEvent) {
    if (!this.iconClickable) return;
    event.preventDefault();
  }

  /** Sets the minimum selectable date to today for date-type inputs if not already provided. */
  ngOnInit() {
    if (this.type === 'date' && !this.minDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      this.minDate = `${yyyy}-${mm}-${dd}`;
    }
  }
}
