import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksDb } from '../../core/db/tasks.db';
import { SupabaseService } from '../../services/supabase';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);
  private supabase = inject(SupabaseService);
  private mobileGreetingTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly mobileGreetingStorageKey = 'show-summary-mobile-greeting';
  tasks = this.tasksDb.tasks;
  userName = signal('');
  isGuestSession = signal(false);
  showMobileGreetingOverlay = signal(false);
  isPreparingMobileGreeting = signal(false);
  hasDisplayName = computed(() => this.userName().trim().length > 0 && !this.isGuestSession());

  personalizedGreeting = computed(() => {
    const greeting = this.getTimeBasedGreeting();

    if (!this.hasDisplayName()) {
      return `${greeting}!`;
    }

    return `${greeting},`;
  });

  todoCount = computed(() => this.tasks().filter((task) => task.status === 'todo').length);
  doneCount = computed(() => this.tasks().filter((task) => task.status === 'done').length);
  inProgressCount = computed(() => this.tasks().filter((task) => task.status === 'in-progress').length);
  awaitFeedbackCount = computed(() => this.tasks().filter((task) => task.status === 'await-feedback').length);
  urgentCount = computed(() => this.tasks().filter((task) => task.priority === 'urgent').length);
  totalTasksCount = computed(() => this.tasks().length);

  earliestOpenDueDate = computed(() => {
    const openTasks = this.tasks().filter((task) => task.status !== 'done');

    const validDates = openTasks
      .map((task) => this.parseDate(task.due_date))
      .filter((date): date is Date => date !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    if (validDates.length === 0) {
      return 'No upcoming deadline';
    }

    return validDates[0].toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });

  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 5) {
      return 'Good night';
    } else if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }

  private async loadCurrentUserGreetingContext() {
    const { data } = await this.supabase.getSession();
    const sessionUser = data.session?.user;
    const email = sessionUser?.email?.toLowerCase() ?? '';

    if (!email) {
      this.userName.set('');
      this.isGuestSession.set(false);
      return;
    }

    const isGuest = email === environment.guestEmail.toLowerCase();
    this.isGuestSession.set(isGuest);

    if (isGuest) {
      this.userName.set('');
      return;
    }

    const { data: contact, error } = await this.supabase.client
      .from('contacts')
      .select('name')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      const metadataName = String(
        sessionUser?.user_metadata?.['full_name'] ?? sessionUser?.user_metadata?.['name'] ?? ''
      ).trim();
      this.userName.set(metadataName || this.getNameFallbackFromEmail(email));
      return;
    }

    const fullContactName = (contact?.name ?? '').trim();
    const metadataName = String(
      sessionUser?.user_metadata?.['full_name'] ?? sessionUser?.user_metadata?.['name'] ?? ''
    ).trim();

    this.userName.set(fullContactName || metadataName || this.getNameFallbackFromEmail(email));
  }

  private getNameFallbackFromEmail(email: string): string {
    const localPart = email.split('@')[0] ?? '';
    if (!localPart) {
      return '';
    }

    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
      .trim();
  }

  private parseDate(dueDate: string): Date | null {
    if (!dueDate) {
      return null;
    }

    const dateOnlyMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(dueDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  async ngOnInit() {
    const shouldShowMobileGreetingOverlay = this.consumeMobileGreetingTrigger();

    if (shouldShowMobileGreetingOverlay) {
      this.isPreparingMobileGreeting.set(true);
    }

    await Promise.all([
      this.tasksDb.getTasks(),
      this.loadCurrentUserGreetingContext(),
    ]);

    if (shouldShowMobileGreetingOverlay) {
      this.startMobileGreetingOverlay();
    }

    this.tasksDb.subscribeToTaskChanges();
  }

  private consumeMobileGreetingTrigger(): boolean {
    const shouldShow = sessionStorage.getItem(this.mobileGreetingStorageKey) === '1';
    sessionStorage.removeItem(this.mobileGreetingStorageKey);

    return shouldShow && window.innerWidth < 1100;
  }

  private startMobileGreetingOverlay() {
    this.showMobileGreetingOverlay.set(true);
    this.mobileGreetingTimeout = setTimeout(() => {
      this.showMobileGreetingOverlay.set(false);
      this.isPreparingMobileGreeting.set(false);
      this.mobileGreetingTimeout = null;
    }, 3000);
  }

  ngOnDestroy() {
    if (this.mobileGreetingTimeout) {
      clearTimeout(this.mobileGreetingTimeout);
    }
    this.tasksDb.unsubscribeFromTaskChanges();
  }

}
