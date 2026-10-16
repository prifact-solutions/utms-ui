import { Router } from '@angular/router';

/**
 * Tracks whether the current browser tab is a course preview opened from the
 * builder's publish (organize contents) page. sessionStorage is per tab, so the
 * flag survives navigation inside the preview tab without leaking to other tabs.
 */
export class PreviewSession {
  static readonly QUERY_PARAM = 'preview';

  private static key(programId: number): string {
    return `preview_from_publish_${programId}`;
  }

  static publishPath(programId: number): string {
    return `/programs-builder/${programId}/organize-contents`;
  }

  static mark(programId: number): void {
    try {
      sessionStorage.setItem(this.key(programId), '1');
    } catch {
      // Storage unavailable: back buttons fall back to the learner flow
    }
  }

  static isActive(programId: number): boolean {
    try {
      return sessionStorage.getItem(this.key(programId)) === '1';
    } catch {
      return false;
    }
  }

  /** Close the preview tab and focus the publish tab that opened it; otherwise navigate there in this tab. */
  static backToPublish(router: Router, programId: number): void {
    const publishPath = this.publishPath(programId);
    try {
      const opener = window.opener as Window | null;
      // href covers both hash (/#/path) and path-based routing
      if (opener && !opener.closed && opener.location.href.includes(publishPath)) {
        opener.focus();
        window.close();
        if (window.closed) return;
      }
    } catch {
      // Opener not accessible: fall back to in-tab navigation
    }
    router.navigateByUrl(publishPath);
  }
}
