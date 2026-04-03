import { Component, OnDestroy, OnInit, output, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { Subscription } from '@supabase/supabase-js';

@Component({
  selector: 'app-navi',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './navi.html',
  styleUrl: './navi.scss',
})
export class Navi implements OnInit, OnDestroy {
  private static readonly NAV_COLLAPSE_STORAGE_KEY = 'flowdesk.nav.collapsed';
  isLoggedIn = signal<boolean>(false);
  isCollapsed = signal<boolean>(false);
  collapsedChange = output<boolean>();
  private authSubscription?: Subscription;

  /**
   * Creates the navi component.
   * @param supabase Supabase service used for session/auth state.
   */
  constructor(private supabase: SupabaseService) {}

  /**
   * Initializes auth state and subscribes to auth changes.
   * @returns Promise that resolves when initial auth state is applied.
   */
  async ngOnInit() {
    this.restoreCollapsedState();
    const { data } = await this.supabase.getSession();
    this.isLoggedIn.set(!!data.session);
    this.subscribeToAuthChanges();
  }

  /**
   * Restores the saved navigation collapse state from local storage.
   * @returns Nothing.
   */
  private restoreCollapsedState() {
    if (typeof window === 'undefined') {
      return;
    }

    const savedValue = window.localStorage.getItem(Navi.NAV_COLLAPSE_STORAGE_KEY);
    const isCollapsed = savedValue === 'true';

    this.isCollapsed.set(isCollapsed);
    this.collapsedChange.emit(isCollapsed);
  }

  /**
   * Subscribes to auth state changes and updates login status.
   * @returns Nothing.
   */
  private subscribeToAuthChanges() {
    const {
      data: { subscription },
    } = this.supabase.onAuthStateChange((_event, session) => {
      this.isLoggedIn.set(!!session);
    });

    this.authSubscription = subscription;
  }

  /**
   * Cleans up auth-state subscription on component destroy.
   * @returns Nothing.
   */
  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  /**
   * Toggles desktop collapse state and notifies layout.
   * @returns Nothing.
   */
  toggleCollapse() {
    this.isCollapsed.update((value) => !value);
    const isCollapsed = this.isCollapsed();

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(Navi.NAV_COLLAPSE_STORAGE_KEY, String(isCollapsed));
    }

    this.collapsedChange.emit(isCollapsed);
  }
}
