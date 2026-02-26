import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-textarea',
  imports: [],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
})
export class Textarea {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 3;
  @Input() value: string = '';
  @Input() errorMessage: string = '';
}
