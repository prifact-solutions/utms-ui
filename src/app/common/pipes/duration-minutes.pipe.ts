import { Pipe, PipeTransform } from '@angular/core';

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * 60;

/** Formats a duration held in minutes, e.g. 90 -> "1 hr 30 min", 20160 -> "14 days". */
@Pipe({ name: 'durationMinutes' })
export class DurationMinutesPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const total = Math.round(Number(value));
    if (!Number.isFinite(total) || total <= 0) {
      return '0 min';
    }

    const days = Math.floor(total / MINUTES_PER_DAY);
    const hours = Math.floor((total % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
    const minutes = total % MINUTES_PER_HOUR;

    const parts: string[] = [];
    if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
    if (minutes) parts.push(`${minutes} min`);
    return parts.join(' ');
  }
}
