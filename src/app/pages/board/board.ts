import { Component, OnInit, OnDestroy, computed, inject, signal, viewChild, effect } from '@angular/core';
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

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, InputFieldComponent, Button, TaskBoard, TaskAddFormComponent, TaskDetailComponent, UserFeedbackComponent, Main],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})

export class Board implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);
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

  priorityFilter = signal<Task['priority'] | null>(null);
  categoryFilter = signal<Task['category'] | null>(null);
  showFilters = signal(false);

  readonly priorities: Task['priority'][] = ['urgent', 'medium', 'low'];
  readonly categories: Task['category'][] = ['Technical Task', 'User Story', 'Bug', 'Feature'];

  togglePriorityFilter(p: Task['priority']): void {
    this.priorityFilter.set(this.priorityFilter() === p ? null : p);
  }

  toggleCategoryFilter(c: Task['category']): void {
    this.categoryFilter.set(this.categoryFilter() === c ? null : c);
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
    return this.tasks().filter(
      (t) =>
        (term === '' || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)) &&
        (prio === null || t.priority === prio) &&
        (cat === null || t.category === cat),
    );
  });
}
