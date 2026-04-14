import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';


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
  @Input() bootstrapIconStart?: string;
  @Input() bootstrapIconEnd?: string;
  @Input() bootstrapIconEndClickable = false;
  @Input() bootstrapIconEndLabel = '';
  @Input() error: string | null = null;
  @Input() warning: string | null = null;
  @Input() maxlength: number | null = null;
  @Input() minDate: string | null = null;
  @Input() autoMinDate = true;
  @Input() isRequired: boolean = false;
  @Input() displayLabel: boolean = true;
  @Input() reserveErrorSpace: boolean = false;
  @Input() autocomplete: string = 'off';
  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>();
  @Output() blur = new EventEmitter<void>();
  @Output() inputChange = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<void>();
  @Output() iconClick = new EventEmitter<void>();

  get describedById(): string | null {
    if (!this.label) return null;
    return (this.error || this.warning) ? this.label + 'Error' : null;
  }

  get hasMessage(): boolean {
    return !!(this.error || this.warning);
  }

  get message(): string | null {
    return this.error || this.warning;
  }

  get hasWarningOnly(): boolean {
    return !this.error && !!this.warning;
  }

  /**
   * Emits the updated input value and original input event.
   * @param event Native input event from the field.
   * @returns Nothing.
   */
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.modelChange.emit(value);
    this.inputChange.emit(event);
  }

  /**
   * Emits focus and opens the native picker for date inputs when supported.
   * @param event Native focus event from the input field.
   */
  onFocus(event: FocusEvent) {
    this.focus.emit();

    if (this.type !== 'date') return;
    const input = event.target as HTMLInputElement;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    }
  }

  /**
   * Emits icon-click event when icon interaction is enabled.
   * @returns Nothing.
   */
  onIconClick() {
    if (!this.iconClickable && !this.bootstrapIconEndClickable) return;
    this.iconClick.emit();
  }

  /**
   * Prevents focus loss on icon press when icon interaction is enabled.
   * @param event Mouse event from icon pointer-down.
   * @returns Nothing.
   */
  onIconPointerDown(event: MouseEvent) {
    if (!this.iconClickable && !this.bootstrapIconEndClickable) return;
    event.preventDefault();
  }

  /**
   * Initializes minimum date for date inputs when not provided externally.
   * @returns Nothing.
   */
  ngOnInit() {
    if (this.type === 'date' && this.autoMinDate && !this.minDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      this.minDate = `${yyyy}-${mm}-${dd}`;
    }
  }
}
