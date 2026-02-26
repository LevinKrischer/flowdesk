import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/db/tasks.db';


@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule], // ❌
    templateUrl: './task-card.html',
    styleUrls: ['./task-card.scss'],
})
export class TaskCardComponent {
    @Input() task!: Task;
    @Output() openTask = new EventEmitter<Task>(); // Event für Klick

    onClick() {
        this.openTask.emit(this.task); // Task nach oben zum Board senden
    }
    /**
     * Emitted when the card is clicked. Passing the task allows the caller to
     * open a detail view.
     */
    @Output() open = new EventEmitter<Task>();

    /**
     * Comma-separated list of assigned contact names used for accessibility / screen readers.
     */
    get assignedNames(): string {
        return this.task?.contacts?.map(c => c.name).join(', ') || '';
    }

    /**
     * Human readable subtasks string like "1/3 Subtasks".
     */
    get completedSubtasks(): string {
        const total = this.task?.subtasks?.length || 0;
        if (total === 0) {
            return '';
        }
        const done = this.task.subtasks.filter(s => s.done).length;
        return `${done}/${total} Subtasks`;
    }

    /**
     * Percentage completion of subtasks used to style progress bar.
     */
    get subtaskPercent(): number {
        const total = this.task?.subtasks?.length || 0;
        if (total === 0) {
            return 0;
        }
        const done = this.task.subtasks.filter(s => s.done).length;
        return Math.round((done / total) * 100);
    }

    /**
     * Short two‑letter initials derived from a contact name.
     */
    initials(name: string): string {
        if (!name) {
            return '';
        }
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }

    /**
     * Color used for the category badge; fallback to gray when unknown.
     */
    get categoryColor(): string {
        const cat = this.task?.category?.toLowerCase() || '';
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
}