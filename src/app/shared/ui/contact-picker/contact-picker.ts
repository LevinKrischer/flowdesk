import { Component, Input, Output, EventEmitter, signal, computed, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../core/db/contacts.db';

@Component({
  selector: 'app-contact-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-picker.html',
  styleUrl: './contact-picker.scss',
})
export class ContactPicker {
  @Input() contacts: Contact[] = [];
  @Output() selectedIdsChange = new EventEmitter<number[]>();

  isOpen = signal(false);
  searchTerm = signal('');
  selectedIds = signal<number[]>([]);

  filteredContacts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.contacts;
    return this.contacts.filter(c => c.name.toLowerCase().includes(term));
  });

  selectedContacts = computed(() => {
    const ids = this.selectedIds();
    return this.contacts.filter(c => ids.includes(c.id));
  });

  constructor(private elRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  open() {
    this.isOpen.set(true);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.isOpen.set(true);
  }

  // if cklicked on li
  toggleContact(contactId: number) {
    const current = this.selectedIds();
    const updated = current.includes(contactId)
      ? current.filter(id => id !== contactId)
      : [...current, contactId];
    this.selectedIds.set(updated);
    this.selectedIdsChange.emit(updated);
  }

  isSelected(contactId: number): boolean {
    return this.selectedIds().includes(contactId);
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase();
  }
}
