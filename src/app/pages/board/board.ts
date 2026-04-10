import { Component, OnInit, OnDestroy, HostListener, computed, inject, signal, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksDb, Task } from '../../core/db/tasks.db';
import { Button } from '../../shared/ui/button/button';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { TaskBoard } from './task-board/task-board';
import { TaskAddFormComponent } from '../../components/task-add-form/task-add-form';
import { TaskDetailComponent } from './task-detail/task-detail';
import { UserFeedbackComponent } from '../../shared/ui/user-feedback/user-feedback';
import { Main } from '../../shared/ui/main/main';
import { SupabaseService } from '../../services/supabase';
import { InitialsPipe } from '../../services/initials.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, InputFieldComponent, Button, TaskBoard, TaskAddFormComponent, TaskDetailComponent, UserFeedbackComponent, Main, InitialsPipe],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})

export class Board implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);
  private supa = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  tasks = this.tasksDb.tasks;
  todoTasks = computed(() => this.tasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasks().filter((t) => t.status === 'in-progress'));
  awaitFeedbackTasks = computed(() => this.tasks().filter((t) => t.status === 'await-feedback'));
  doneTasks = computed(() => this.tasks().filter((t) => t.status === 'done'));
  isModalOpen = signal(false);
  modalMode: 'add' | 'detail' = 'add';
  selectedTaskId = signal<number | null>(null);
  selectedTask = computed(() => this.tasks().find((t) => t.id === this.selectedTaskId()) ?? null);
  compactView = signal(localStorage.getItem('board.compactView') === 'true');

  // ─── Filter signals ──────────────────────────────────────────────────────
  priorityFilter = signal<Task['priority'] | null>(null);
  categoryFilter = signal<Task['category'] | null>(null);
  dueFilter = signal<'soon' | 'overdue' | null>(null);
  assignedContactIds = signal<number[]>([]);
  assignedToMe = signal(false);
  isGuestSession = signal(false);
  currentUserContactId = signal<number | null>(null);
  activeDropdown = signal<'priority' | 'category' | 'due' | 'assignees' | null>(null);
  showFilters = signal(false);

  readonly priorities: Task['priority'][] = ['urgent', 'medium', 'low'];
  readonly categories: Task['category'][] = ['Technical Task', 'User Story', 'Bug', 'Feature'];
  readonly dueOptions: { value: 'soon' | 'overdue'; label: string; icon: string }[] = [
    { value: 'soon', label: 'Due soon', icon: 'bi-hourglass-split' },
    { value: 'overdue', label: 'Overdue', icon: 'bi-exclamation-circle' },
  ];

  allContacts = computed(() => {
    const seen = new Set<number>();
    const result: { id: number; name: string; color: string }[] = [];
    for (const task of this.tasks()) {
      for (const c of task.contacts) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          result.push(c);
        }
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  });

  hasActiveFilters = computed(
    () =>
      this.priorityFilter() !== null ||
      this.categoryFilter() !== null ||
      this.dueFilter() !== null ||
      this.assignedContactIds().length > 0 ||
      this.assignedToMe(),
  );

  @HostListener('document:click')
  closeDropdowns() {
    this.activeDropdown.set(null);
  }

  toggleDropdown(name: 'priority' | 'category' | 'due' | 'assignees') {
    this.activeDropdown.set(this.activeDropdown() === name ? null : name);
  }

  togglePriorityFilter(p: Task['priority']): void {
    this.priorityFilter.set(this.priorityFilter() === p ? null : p);
  }

  toggleCategoryFilter(c: Task['category']): void {
    this.categoryFilter.set(this.categoryFilter() === c ? null : c);
  }

  toggleDueFilter(value: 'soon' | 'overdue'): void {
    this.dueFilter.set(this.dueFilter() === value ? null : value);
  }

  toggleContactFilter(id: number): void {
    const current = this.assignedContactIds();
    if (current.includes(id)) {
      this.assignedContactIds.set(current.filter((x) => x !== id));
    } else {
      this.assignedContactIds.set([...current, id]);
    }
  }

  clearAllFilters(): void {
    this.priorityFilter.set(null);
    this.categoryFilter.set(null);
    this.dueFilter.set(null);
    this.assignedContactIds.set([]);
    this.assignedToMe.set(false);
  }

  getPriorityLabel(): string {
    const p = this.priorityFilter();
    return p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Priority';
  }

  getDueLabel(): string {
    const d = this.dueFilter();
    if (d === 'soon') return 'Due soon';
    if (d === 'overdue') return 'Overdue';
    return 'Due date';
  }

  getCategoryClass(cat: string): string {
    return cat.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Opens the modal in add mode and clears any selected task.
   * @returns Nothing.
   */
  openAdd() {
    this.modalMode = 'add';
    this.selectedTaskId.set(null);
    this.isModalOpen.set(true);
  }

  /**
   * Opens the modal in detail mode for the selected task.
   * @param task Task to display in detail view.
   * @returns Nothing.
   */
  openDetail(task: Task) {
    this.modalMode = 'detail';
    this.selectedTaskId.set(task.id);
    this.isModalOpen.set(true);
    this.router.navigate([], { queryParams: { task: task.id }, queryParamsHandling: 'merge' });
  }

  /**
   * Closes the modal wrapper.
   * @returns Nothing.
   */
  closeModal() {
    this.isModalOpen.set(false);
    this.router.navigate([], { queryParams: { task: null }, queryParamsHandling: 'merge' });
  }

  /**
   * Reacts to route fragments and scrolls the matching element into view.
   */
  constructor() {
    effect(() => {
      localStorage.setItem('board.compactView', String(this.compactView()));
    });
    effect(() => {
      const fragment = this.route.snapshot.fragment;
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 0);
      }
    });
  }

  /**
   * Loads initial tasks and starts realtime task updates.
   * @returns Promise that resolves when initialization is completed.
   */

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasksDb.subscribeToTaskChanges();
    const taskParam = this.route.snapshot.queryParamMap.get('task');
    if (taskParam) {
      const task = this.tasks().find((t) => t.id === Number(taskParam));
      if (task) {
        this.openDetail(task);
      }
    }
    const { data: { session } } = await this.supa.getSession();
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase();
      this.isGuestSession.set(email === environment.guestEmail.toLowerCase());
      const { data } = await this.supa.client
        .from('contacts')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (data) this.currentUserContactId.set(data.id);
    }
  }

  /**
   * Handles teardown of task update subscriptions.
   * @returns Nothing.
   */
  ngOnDestroy() {
    this.tasksDb.unsubscribeFromTaskChanges();
    this.tasksDb.subscribeToTaskChanges();
  }

  feedbackRef = viewChild.required<UserFeedbackComponent>('feedback');

  /**
   * Shows a success message after task deletion.
   * @returns Nothing.
   */
  onTaskDeleted() {
    this.feedbackRef().show('Task successfully deleted');
  }

  searchTerm = signal('');

  filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const prio = this.priorityFilter();
    const cat = this.categoryFilter();
    const due = this.dueFilter();
    const contactIds = this.assignedContactIds();
    const toMe = this.assignedToMe();
    const myId = this.currentUserContactId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soonLimit = new Date(today);
    soonLimit.setDate(soonLimit.getDate() + 7);

    return this.tasks().filter((t) => {
      if (term && !t.title.toLowerCase().includes(term) && !t.description.toLowerCase().includes(term)) return false;
      if (prio && t.priority !== prio) return false;
      if (cat && t.category !== cat) return false;
      if (due === 'soon') {
        const d = new Date(t.due_date);
        if (d < today || d > soonLimit || t.status === 'done') return false;
      }
      if (due === 'overdue') {
        const d = new Date(t.due_date);
        if (d >= today || t.status === 'done') return false;
      }
      if (contactIds.length > 0 && !contactIds.some((id) => t.contacts.some((c) => c.id === id))) return false;
      if (toMe && myId !== null && !t.contacts.some((c) => c.id === myId)) return false;
      return true;
    });
  });
}
