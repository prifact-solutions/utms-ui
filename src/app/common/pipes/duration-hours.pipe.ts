import { Pipe, PipeTransform } from '@angular/core';

const HOURS_PER_DAY = 24;

/** Formats a duration held in hours, e.g. 5 -> "5 hrs", 30 -> "1 day 6 hrs", 336 -> "14 days". */
@Pipe({ name: 'durationHours' })
export class DurationHoursPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const total = Math.round(Number(value));
    if (!Number.isFinite(total) || total <= 0) {
      return '0 hrs';
    }

    const days = Math.floor(total / HOURS_PER_DAY);
    const hours = total % HOURS_PER_DAY;

    const parts: string[] = [];
    if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
    return parts.join(' ');
  }
}
