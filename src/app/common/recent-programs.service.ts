import { Injectable } from '@angular/core';
import { Utils } from './utils';

export interface RecentProgram {
  id: number;
  title: string;
  thumbnail: string | null;
  preview_video_url: string | null;
  accessedAt: number; // timestamp ms
}

const STORAGE_KEY_PREFIX = 'recently_accessed_programs';
const MAX_RECENT = 5;

@Injectable({
  providedIn: 'root',
})
export class RecentProgramsService {
  recordAccess(
    id: number,
    title: string,
    thumbnail: string | null,
    preview_video_url: string | null,
  ): void {
    const key = this.getStorageKey();
    if (!key) {
      return;
    }
    const existing = this.readAllForKey(key);
    // Remove any previous entry for this program
    const filtered = existing.filter((p) => p.id !== id);
    // Prepend the new entry
    const updated: RecentProgram[] = [
      {
        id,
        title,
        thumbnail,
        preview_video_url: preview_video_url,
        accessedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  getRecentPrograms(): RecentProgram[] {
    const key = this.getStorageKey();
    if (!key) {
      return [];
    }

    return this.readAllForKey(key);
  }

  private readAllForKey(key: string): RecentProgram[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw) as RecentProgram[];
    } catch {
      return [];
    }
  }

  private getStorageKey(): string | null {
    const userId = this.currentUserIdFromToken();
    return userId !== null ? `${STORAGE_KEY_PREFIX}_${userId}` : null;
  }

  private currentUserIdFromToken(): string | null {
    try {
      const decoded = Utils.decodeAuthToken() as Record<string, unknown>;
      if (!decoded || Object.keys(decoded).length === 0) {
        return null;
      }
      const raw = decoded['user_id'] ?? decoded['userId'] ?? decoded['sub'];
      if (raw === undefined || raw === null || raw === '') {
        return null;
      }
      return String(raw);
    } catch {
      return null;
    }
  }
}
