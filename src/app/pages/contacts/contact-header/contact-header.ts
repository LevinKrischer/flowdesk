import { Component, Output, EventEmitter } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-contact-header',
  imports: [Button],
  templateUrl: './contact-header.html',
  styleUrl: './contact-header.scss',
})

export class ContactHeader {
  @Output() back = new EventEmitter<void>();
}
