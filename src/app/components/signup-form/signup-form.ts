import { Component } from '@angular/core';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';

@Component({
  selector: 'app-signup-form',
  imports: [ModalWrapper],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {}
