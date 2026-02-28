import { Component, computed, signal, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TasksDb, Task } from '../../../core/db/tasks.db';
import { TaskCardComponent } from '../task-card/task-card';
import { TaskAddFormComponent } from '../../../components/task-add-form/task-add-form';
import { HorizontalScrollDirective } from "../../../services/horizontal-scroll.directive";


@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, TaskAddFormComponent, HorizontalScrollDirective],
  templateUrl: './task-board.html',
  styleUrls: ['./task-board.scss'],
})
export class TaskBoard implements OnInit {
  private tasksDb = inject(TasksDb);

  @Output() open = new EventEmitter<Task>();

  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);
  showAddTaskForm = signal(false);

  todoTasks = computed(() => this.tasks().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasks().filter(t => t.status === 'in-progress'));
  reviewTasks = computed(() => this.tasks().filter(t => t.status === 'await-feedback'));
  doneTasks = computed(() => this.tasks().filter(t => t.status === 'done'));

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasks.set(this.tasksDb.tasks());
    this.tasksDb.subscribeToTaskChanges();
  }

  openTaskDetail(task: Task) {
    this.open.emit(task);
  }

  openAddTask() {
    this.showAddTaskForm.set(true);
  }

  closeAddTask() {
    this.showAddTaskForm.set(false);
  }

  async onTaskCreated() {
    this.showAddTaskForm.set(false);
    await this.tasksDb.getTasks();
    this.tasks.set(this.tasksDb.tasks());
  }

  /**
   * Handles drag & drop events for tasks
   * Updates both local state and database with new status and order
   */
  async onTaskDrop(event: CdkDragDrop<Task[]>, targetStatus: Task['status']) {
    const task = event.item.data || event.previousContainer.data[event.previousIndex];

    // Case 1: Moving within the same column (reordering)
    if (event.previousContainer === event.container) {
      const columnTasks = [...event.container.data];
      moveItemInArray(columnTasks, event.previousIndex, event.currentIndex);

      // Update order numbers for all tasks in this column
      const tasksToUpdate = columnTasks.map((t, index) => ({
        ...t,
        order: index
      }));

      // Update local state
      this.updateLocalTasks(tasksToUpdate);

      // Update database
      await this.tasksDb.updateTaskOrder(tasksToUpdate);

    }
    // Case 2: Moving to a different column
    else {
      const sourceTasks = [...event.previousContainer.data];
      const targetTasks = [...event.container.data];

      transferArrayItem(
        sourceTasks,
        targetTasks,
        event.previousIndex,
        event.currentIndex
      );

      // Update status and order for moved task
      const movedTask = targetTasks[event.currentIndex];
      movedTask.status = targetStatus;

      // Recalculate order numbers for both columns
      const sourceTasksUpdated = sourceTasks.map((t, index) => ({
        ...t,
        order: index
      }));

      const targetTasksUpdated = targetTasks.map((t, index) => ({
        ...t,
        order: index
      }));

      // Update local state
      this.updateLocalTasks([...sourceTasksUpdated, ...targetTasksUpdated]);

      // Update database
      await this.tasksDb.updateTaskOrder([...sourceTasksUpdated, ...targetTasksUpdated]);
    }

    // Refresh tasks from database
    await this.tasksDb.getTasks();
    this.tasks.set(this.tasksDb.tasks());
  }

  /**
   * Updates local tasks signal with new task data
   */
  private updateLocalTasks(updatedTasks: Task[]) {
    const currentTasks = this.tasks();
    const updatedTasksMap = new Map(updatedTasks.map(t => [t.id, t]));

    const newTasks = currentTasks.map(t =>
      updatedTasksMap.has(t.id) ? updatedTasksMap.get(t.id)! : t
    );

    this.tasks.set(newTasks);
  }
}
