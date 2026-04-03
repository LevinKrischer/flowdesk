import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TaskAddFormComponent } from '../../components/task-add-form/task-add-form';
import { Main } from '../../shared/ui/main/main';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [TaskAddFormComponent, Main],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})

export class AddTask {
  constructor(private router: Router) {}

  /** Navigates to the board page after a task has been created. */
  onTaskCreated() {
    this.router.navigate(['/board']);
  }
}
