import { Component } from '@angular/core';
import { BackButton } from '../../shared/ui/forms/back-button/back-button';
import { Main } from '../../shared/ui/main/main';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [BackButton, Main],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.scss',
})

export class LegalNotice {}
