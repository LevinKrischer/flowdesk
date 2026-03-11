import { Pipe, PipeTransform } from '@angular/core';

/**
 * Angular pipe that truncates a string to a given length, appending an ellipsis.
 *
 * @example
 * {{ 'A very long text' | truncate }}       → 'A very long text'
 * {{ 'A very long text' | truncate:10 }}    → 'A very lon…'
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {

  /**
   * Truncates the value if it exceeds the character limit.
   *
   * @param value - The string to truncate.
   * @param limit - Maximum number of characters before truncation (default `30`).
   * @returns The original or truncated string with a trailing ellipsis.
   */
  transform(value: string, limit: number = 30): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit) + '…' : value;
  }
}
