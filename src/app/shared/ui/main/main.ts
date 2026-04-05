import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-main',
  imports: [],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  @Input() fullWidth = false;
  @Input() noPaddingX = false;
  @Input() noPaddingBottom = false;
}
