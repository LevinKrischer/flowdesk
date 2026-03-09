import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksDb } from '../../core/db/tasks.db';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);
  tasks = this.tasksDb.tasks;

  todoCount = computed(() => this.tasks().filter((task) => task.status === 'todo').length);
  doneCount = computed(() => this.tasks().filter((task) => task.status === 'done').length);
  inProgressCount = computed(() => this.tasks().filter((task) => task.status === 'in-progress').length);
  awaitFeedbackCount = computed(() => this.tasks().filter((task) => task.status === 'await-feedback').length);
  urgentCount = computed(() => this.tasks().filter((task) => task.priority === 'urgent').length);
  totalTasksCount = computed(() => this.tasks().length);

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasksDb.subscribeToTaskChanges();
  }

  ngOnDestroy() {
    this.tasksDb.unsubscribeFromTaskChanges();
  }

}
