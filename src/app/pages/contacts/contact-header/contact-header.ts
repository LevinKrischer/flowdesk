import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-contact-header',
  imports: [],
  templateUrl: './contact-header.html',
  styleUrl: './contact-header.scss',
})

export class ContactHeader {
  @Output() back = new EventEmitter<void>();
}
