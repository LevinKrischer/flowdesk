import { Component, signal, input, output, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksDb, Task, Subtask } from '../../../core/db/tasks.db';
import { TaskAddFormComponent } from '../../../components/task-add-form/task-add-form';
import { UserFeedbackComponent } from '../../../shared/ui/user-feedback/user-feedback';
import { ModalWrapper } from '../../../shared/ui/modal-wrapper/modal-wrapper';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, TaskAddFormComponent, UserFeedbackComponent, ModalWrapper],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.scss'],
})

export class TaskDetailComponent {
  private taskDbSingleton = inject(TasksDb);
  task = input.required<Task>();
  close = output<void>();
  deleted = output<void>();
  userFeedback = viewChild.required<UserFeedbackComponent>('feedback');
  isEditing = signal(false);

  /**
   * Returns the appropriate priority icon path for the current task.
   * @returns SVG asset path based on the task priority.
   */
  get priorityIcon(): string {
    const pr = this.task()?.priority?.toLowerCase() || '';
    switch (pr) {
      case 'low':
        return 'assets/icons/prio-low-small-task-32px.svg';
      case 'medium':
        return 'assets/icons/prio-medium-small-task-32px.svg';
      case 'urgent':
        return 'assets/icons/prio-urgent-small-task-32px.svg';
      default:
        return '';
    }
  }

  /**
   * Maps the task category to its display color.
   *
   * @returns Hex color string for the current category.
   */
  get categoryColor(): string {
    const cat = this.task()?.category?.toLowerCase() || '';
    switch (cat) {
      case 'user story':
        return '#3f51b5';
      case 'technical task':
        return '#009688';
      case 'bug':
        return '#e91e63';
      default:
        return '#607d8b';
    }
  }

  /**
   * Builds up to two uppercase initials from a full name.
   * @param name - Full name string to extract initials from.
   * @returns Uppercase initials (max 2 characters).
   */
  initials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  /** Deletes the current task, emits deletion/close events, and removes it from the database. */
  async deleteTask() {
    try {
      this.deleted.emit();
      this.close.emit();
      await this.taskDbSingleton.deleteTask(this.task().id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  /** Switches the detail view into editing mode. */
  updateTask() {
    this.isEditing.set(true);
  }

  /** Exits editing mode after a task has been successfully updated. */
  async onTaskUpdated() {
    this.isEditing.set(false);
  }

  /** Exits editing mode when the user cancels the edit. */
  onEditCancelled() {
    this.isEditing.set(false);
  }

  /**
   * Toggles a subtask's done state and persists the change.
   * @param subtask - The subtask to toggle.
   */
  async toggleSubtask(subtask: Subtask) {
    try {
      subtask.done = !subtask.done;

      await this.taskDbSingleton.updateTask(this.task().id, {
        subtasks: this.task().subtasks,
      });

    } catch (err) {
      console.error('Failed to update subtask:', err);
      subtask.done = !subtask.done;
      this.userFeedback().show('Failed to update subtask. Please try again');
    }
  }
}
