import { Component } from '@angular/core';
import { BackButton } from '../../shared/ui/forms/back-button/back-button';
import { Main } from '../../shared/ui/main/main';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [BackButton, Main],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})

export class PrivacyPolicy {}
