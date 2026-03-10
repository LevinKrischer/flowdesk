import { Component, input, output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';
import { FormsModule } from '@angular/forms';
import { isValidEmail, isValidPassword } from '../../core/utils/validation';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-signup-form',
  imports: [ModalWrapper, FormsModule, InputFieldComponent, Button],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  submitted = output<{ name: string; email: string; password: string }>();

  errorMessage = input('');

  form = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    privacyPolicy: false,
  };

  errors = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    privacyPolicy: '',
  };

  dirty = {
    name: false,
    email: false,
    password: false,
    passwordConfirmation: false,
    privacyPolicy: false,
  };

  /**
   * Marks a specific form field as dirty and triggers validation for it.
   * Dirty fields show validation errors immediately when modified.
   * @param {keyof typeof this.dirty} field - The field to mark as dirty.
   */
  markDirty(field: keyof typeof this.dirty) {
    this.dirty[field] = true;
    this.validateField(field);
  }

  /**
   * Performs validation on a field only if it has already been marked as dirty.
   * Used for live validation while typing.
   * @param {keyof typeof this.dirty} field - The field to validate.
   */
  liveValidate(field: keyof typeof this.dirty) {
    if (this.dirty[field]) {
      this.validateField(field);
    }
  }

  /**
   * Validates a single form field and updates the corresponding error message.
   * Delegates validation logic to shared utility functions.
   * @param {keyof typeof this.form} field - The field to validate.
   */
  validateField(field: keyof typeof this.form) {
    const value = this.form[field];

    switch (field) {
      case 'name':
        this.errors.name = (value as string).trim() !== '' ? '' : 'Name is required.';
        break;
      case 'email':
        this.errors.email = isValidEmail(value as string)
          ? ''
          : 'Please enter a valid email address with maximum 35 characters.';
        break;
      case 'password':
        this.errors.password = isValidPassword(value as string)
          ? ''
          : 'Password must be at least 8 characters long.';
        break;
      case 'passwordConfirmation':
        this.errors.passwordConfirmation =
          (value as string) === this.form.password ? '' : 'Passwords do not match.';
        break;
      case 'privacyPolicy':
        this.errors.privacyPolicy = value ? '' : 'You must accept the Privacy Policy.';
        break;
    }
  }

  submit() {
    this.markAllDirty();
    if (!this.isFormValid()) return;

    this.submitted.emit({
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
    });
  }

  /**
   * Marks all form fields as dirty to ensure full validation before submission.
   */
  private markAllDirty() {
    this.markDirty('name');
    this.markDirty('email');
    this.markDirty('password');
    this.markDirty('passwordConfirmation');
    this.markDirty('privacyPolicy');
  }

  /**
   * Checks whether all form fields contain valid values and no validation errors remain.
   * @returns {boolean} True if the form is valid, otherwise false.
   */
  isFormValid() {
    return (
      this.form.name.trim() !== '' &&
      this.form.email.trim() !== '' &&
      this.form.password.trim() !== '' &&
      this.form.passwordConfirmation.trim() !== '' &&
      this.form.privacyPolicy &&
      !this.errors.name &&
      !this.errors.email &&
      !this.errors.password &&
      !this.errors.passwordConfirmation &&
      !this.errors.privacyPolicy
    );
  }
}
