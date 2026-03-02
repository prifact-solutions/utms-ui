import { Injectable } from '@angular/core';

export interface RecentProgram {
    id: number;
    title: string;
    thumbnail: string | null;
    accessedAt: number; // timestamp ms
}

const STORAGE_KEY = 'recently_accessed_programs';
const MAX_RECENT = 6;

@Injectable({
    providedIn: 'root'
})
export class RecentProgramsService {

    recordAccess(id: number, title: string, thumbnail: string | null): void {
        const existing = this.readAll();
        // Remove any previous entry for this program
        const filtered = existing.filter(p => p.id !== id);
        // Prepend the new entry
        const updated: RecentProgram[] = [
            { id, title, thumbnail, accessedAt: Date.now() },
            ...filtered
        ].slice(0, MAX_RECENT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    getRecentPrograms(): RecentProgram[] {
        return this.readAll();
    }

    private readAll(): RecentProgram[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            return JSON.parse(raw) as RecentProgram[];
        } catch {
            return [];
        }
    }
}
