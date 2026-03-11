import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length <= 1) return (parts[0]?.[0] ?? '').toUpperCase();
    return ((parts[0][0] ?? '') + (parts.at(-1)![0] ?? '')).toUpperCase();
  }
}
