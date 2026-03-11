import { Pipe, PipeTransform } from '@angular/core';

/**
 * Angular pipe that extracts uppercase initials from a full name.
 *
 * @example
 * {{ 'John Doe' | initials }}        → 'JD'
 * {{ 'Alice' | initials }}            → 'A'
 * {{ 'A B C' | initials }}            → 'AC'
 */
@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {

  /**
   * Extracts the first letter of the first and last name parts.
   * For single-word names, returns the first letter only.
   *
   * @param name - The full name string to extract initials from.
   * @returns Uppercase initials (1–2 characters).
   */
  transform(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length <= 1) return (parts[0]?.[0] ?? '').toUpperCase();
    return ((parts[0][0] ?? '') + (parts.at(-1)![0] ?? '')).toUpperCase();
  }

}
