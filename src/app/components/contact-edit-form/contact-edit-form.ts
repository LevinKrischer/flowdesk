import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactsDb, Contact, ContactWithInitials } from './../../core/db/contacts.db';
import { isValidName, isValidEmail, isValidPhone } from '../../core/utils/validation';
import { InputFieldComponent } from '../../shared/ui/input-field/input-field';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-contact-edit-form',
  standalone: true,
  imports: [FormsModule, InputFieldComponent, ModalWrapper, Button],
  templateUrl: './contact-edit-form.html',
  styleUrls: ['./contact-edit-form.scss'],
})
export class ContactEditFormComponent {
  db = inject(ContactsDb);

  @Input() contact: ContactWithInitials | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  form: Partial<Contact> = {
    name: '',
    email: '',
    phone: '',
  };

  errors = {
    name: '',
    email: '',
    phone: '',
  };

  dirty = {
    name: false,
    email: false,
    phone: false,
  };

  ngOnChanges() {
    if (!this.contact) return;

    this.form = {
      name: this.contact.name,
      email: this.contact.email,
      phone: this.contact.phone,
    };
  }

  markDirty(field: keyof typeof this.dirty) {
    this.dirty[field] = true;
    this.validateField(field);
  }

  liveValidate(field: keyof typeof this.dirty) {
    if (this.dirty[field]) {
      this.validateField(field);
    }
  }

  validateField(field: keyof typeof this.form) {
    if (!this.contact) return;

    const rawValue = this.form[field];
    const value = String(rawValue ?? '');

    switch (field) {
      case 'name':
        this.errors.name = isValidName(value) ? '' : 'Name may only contain letters.';
        break;

      case 'email':
        this.errors.email = isValidEmail(value) ? '' : 'Please enter a valid email address.';
        break;

      case 'phone':
        this.errors.phone = isValidPhone(value)
          ? ''
          : 'Please enter at least 10 digits using numbers only (a leading + is allowed).';
        break;
    }
  }

  isFormValid() {
    return (
      String(this.form.name ?? '').trim() !== '' &&
      String(this.form.email ?? '').trim() !== '' &&
      String(this.form.phone ?? '').trim() !== '' &&
      !this.errors.name &&
      !this.errors.email &&
      !this.errors.phone
    );
  }

  async save() {
    this.markDirty('name');
    this.markDirty('email');
    this.markDirty('phone');

    if (!this.isFormValid() || !this.contact) return;

    await this.db.updateContact(this.contact.id, {
      name: String(this.form.name),
      email: String(this.form.email),
      phone: String(this.form.phone),
    });

    this.saved.emit();
  }

  async delete() {
    if (!this.contact) return;

    await this.db.deleteContact(this.contact.id);
    this.deleted.emit();
  }

  @Output() closed = new EventEmitter<void>();

  onCancel() {
    this.closed.emit();
  }
}
