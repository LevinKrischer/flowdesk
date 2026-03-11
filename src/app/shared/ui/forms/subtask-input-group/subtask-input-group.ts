import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subtask } from '../../../../core/db/tasks.db';

@Component({
  selector: 'app-subtask-input-group',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './subtask-input-group.html',
  styleUrl: './subtask-input-group.scss',
})
export class SubtaskInputGroup {
  subtasks = input<Subtask[]>([]);
  subtasksChange = output<Subtask[]>();

  newSubtaskTitle = '';
  editingSubtaskIndex: number | null = null;
  editingSubtaskTitle = '';

  /** Adds a new subtask from the current input value and emits the updated list. */
  addSubtask() {
    const title = this.newSubtaskTitle.trim();
    if (!title) return;
    const updated = [...this.subtasks(), { title, done: false }];
    this.subtasksChange.emit(updated);
    this.newSubtaskTitle = '';
  }

  /**
   * Removes a subtask at the given index and emits the updated list.
   *
   * @param index - Position of the subtask to remove.
   */
  removeSubtask(index: number) {
    const updated = this.subtasks().filter((_, i) => i !== index);
    this.subtasksChange.emit(updated);
  }

  /**
   * Enters edit mode for the subtask at the given index.
   *
   * @param index - Position of the subtask to edit.
   */
  editSubtask(index: number) {
    this.editingSubtaskIndex = index;
    this.editingSubtaskTitle = this.subtasks()[index].title;
  }

  /** Confirms the current subtask edit, updating or removing it if the title is empty. */
  confirmEditSubtask() {
    const title = this.editingSubtaskTitle.trim();
    if (this.editingSubtaskIndex !== null) {
      if (title) {
        const updated = this.subtasks().map((s, i) =>
          i === this.editingSubtaskIndex ? { ...s, title } : s
        );
        this.subtasksChange.emit(updated);
      } else {
        this.removeSubtask(this.editingSubtaskIndex);
      }
    }
    this.cancelEditSubtask();
  }

  /** Cancels the current subtask edit and resets the editing state. */
  cancelEditSubtask() {
    this.editingSubtaskIndex = null;
    this.editingSubtaskTitle = '';
  }
}
