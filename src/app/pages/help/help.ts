import { Component } from '@angular/core';
import { BackButton } from '../../shared/ui/forms/back-button/back-button';
import { Main } from '../../shared/ui/main/main';

@Component({
  selector: 'app-help',
  imports: [BackButton, Main],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})

export class Help {
}
