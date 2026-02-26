import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksDb, Task } from '../../core/db/tasks.db';
import { Button } from '../../shared/ui/button/button';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { TaskBoard } from './task-board/task-board';
import { AddTaskComponent } from '../add-task/add-task';


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    InputFieldComponent,
    Button,
    TaskBoard,
    AddTaskComponent,

  ],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);

  tasks = this.tasksDb.tasks;

  todoTasks = computed(() => this.tasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasks().filter((t) => t.status === 'in-progress'));
  awaitFeedbackTasks = computed(() => this.tasks().filter((t) => t.status === 'await-feedback'));
  doneTasks = computed(() => this.tasks().filter((t) => t.status === 'done'));


  isModalOpen = signal(false);
  modalMode: 'add' | 'detail' = 'add';
  selectedTask = signal<Task | null>(null);

  openAdd() {
    this.modalMode = 'add';
    this.selectedTask.set(null);
    this.isModalOpen.set(true);
  }

  openDetail(task: Task) {
    this.modalMode = 'detail';
    this.selectedTask.set(task);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasksDb.subscribeToTaskChanges();
  }

  ngOnDestroy() {
    this.tasksDb.unsubscribeFromTaskChanges();
    this.tasksDb.subscribeToTaskChanges();
  }
}
