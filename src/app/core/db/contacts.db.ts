import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  color: string;
}

export interface ContactWithInitials extends Contact {
  initials: string;
}

export interface GroupedContacts {
  letter: string;
  contacts: ContactWithInitials[];
}


@Injectable({ providedIn: 'root' })
export class ContactsDb {

  contacts = signal<Contact[]>([]);
  groupedContacts = signal<GroupedContacts[]>([]);
  channels: RealtimeChannel | null = null;

  constructor(private supa: SupabaseService) { }

  /**
   * Loads all contacts from the Supabase `contacts` table.
   * Updates the `contacts` signal and subscribes to realtime changes.
   * Logs an error if the request fails.
   */
  async getContacts() {
    const { data: contacts, error } = await this.supa.client
      .from('contacts')
      .select('*');

    if (error) {
      console.error('[Supabase] Error loading contacts:', error.message);
      return;
    }

    if (!contacts) return;
    this.contacts.set(contacts || []);

    this.subscripeToContactChanges();
  }

  /**
   * Inserts a new contact into the Supabase `contacts` table.
   * @param contact - Contact data without the `id` field.
   * @returns The inserted contact data returned by Supabase.
   * @throws If the insert operation fails.
   */
  async setContact(contact: Omit<Contact, 'id'>) {
    const { data, error } = await this.supa.client
      .from('contacts')
      .insert([{ ...contact }])
      .select();

    if (error) {
      console.error('[Supabase] Error adding contact:', error.message);
      throw error;
    }

    return data;
  }

  /**
   * Updates an existing contact in the Supabase `contacts` table.
   * @param id - The ID of the contact to update.
   * @param update - Partial contact data to update.
   * @returns The updated contact data returned by Supabase.
   * @throws If the update operation fails.
   */
  async updateContact(id: number, update: Partial<Contact>) {
    const { data, error } = await this.supa.client
      .from('contacts')
      .update(update)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating contact:', error.message);
      throw error;
    }

    return data;
  }

  /**
   * Deletes a contact from the Supabase `contacts` table.
   * First removes all task-contact associations to avoid foreign key constraint violations.
   * @param id - The ID of the contact to delete.
   * @throws If the delete operation fails.
   */
  async deleteContact(id: number) {
    // Step 1: Delete all associations in tasks_contacts table
    const { error: assignmentError } = await this.supa.client
      .from('tasks_contacts')
      .delete()
      .eq('contact_id', id);

    if (assignmentError) {
      console.error('[Supabase] Error deleting contact associations:', assignmentError.message);
      throw assignmentError;
    }

    // Step 2: Delete the contact itself
    const { error: contactError } = await this.supa.client
      .from('contacts')
      .delete()
      .eq('id', id);

    if (contactError) {
      console.error('[Supabase] Error deleting contact:', contactError.message);
      throw contactError;
    }
  }

  /**
   * Angular lifecycle hook.
   * Cleans up the realtime subscription when the service is destroyed.
   */
  ngOnDestroy() {
    this.unSubscripeFromContactChanges();
  }

  /**
   * Subscribes to realtime changes on the Supabase `contacts` table.
   * Whenever a change occurs, contacts are reloaded.
   */
  subscripeToContactChanges() {
    this.channels = this.supa.client.channel('custom-all-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        async () => {
          await this.getContacts();
        }
      )
      .subscribe();
  }

  /**
   * Unsubscribes from the realtime channel if it exists.
   * Prevents memory leaks and duplicate subscriptions.
   */
  unSubscripeFromContactChanges() {
    if (this.channels) {
      this.supa.client.removeChannel(this.channels);
    }
  }
}
