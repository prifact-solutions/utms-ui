import { Location } from '@angular/common';
import { Router } from '@angular/router';

/** Builder page a preview was started from; back buttons in the preview return there. */
export type PreviewSource = 'publish' | 'builder';

/**
 * Course preview helpers shared by the builder pages (open the preview tab) and
 * the learner pages (detect a preview and return to the builder).
 *
 * The preview tab is marked in sessionStorage, which is per tab, so the flag
 * survives navigation inside the preview tab without leaking to other tabs.
 */
export class PreviewSession {
  static readonly QUERY_PARAM = 'preview';

  private static key(programId: number): string {
    return `preview_from_publish_${programId}`;
  }

  private static tabName(programId: number): string {
    return `course-preview-${programId}`;
  }

  // ---- Learner side (inside the preview tab) ----

  /** Remember for this tab that the course is being previewed, and from where. */
  static mark(programId: number, source: string | null): void {
    try {
      sessionStorage.setItem(this.key(programId), source === 'builder' ? 'builder' : 'publish');
    } catch {
      // Storage unavailable: back buttons fall back to the learner flow
    }
  }

  static isActive(programId: number): boolean {
    return this.source(programId) !== null;
  }

  private static source(programId: number): PreviewSource | null {
    try {
      const value = sessionStorage.getItem(this.key(programId));
      if (!value) return null;
      return value === 'builder' ? 'builder' : 'publish'; // legacy '1' = publish
    } catch {
      return null;
    }
  }

  private static returnPath(programId: number): string {
    return this.source(programId) === 'builder'
      ? `/programs-builder/${programId}/manage`
      : `/programs-builder/${programId}/organize-contents`;
  }

  static returnLabel(programId: number): string {
    return this.source(programId) === 'builder' ? 'Back to Course Builder' : 'Back to Publish';
  }

  /** Close the preview tab and focus the builder tab that opened it; otherwise navigate there in this tab. */
  static returnToBuilder(router: Router, programId: number): void {
    const path = this.returnPath(programId);
    try {
      const opener = window.opener as Window | null;
      // href covers both hash (/#/path) and path-based routing
      if (opener && !opener.closed && opener.location.href.includes(path)) {
        opener.focus();
        window.close();
        if (window.closed) return;
      }
    } catch {
      // Opener not accessible: fall back to in-tab navigation
    }
    router.navigateByUrl(path);
  }

  // ---- Builder side (starting a preview) ----

  /**
   * Open (or reuse) this course's preview tab. Must run synchronously in the
   * click handler, before any request, so popup blockers allow it.
   */
  static openTab(programId: number): Window | null {
    return window.open('', this.tabName(programId));
  }

  /** Close the tab only if we just opened it blank; never close a preview the user is using. */
  static discardTab(tab: Window | null): void {
    try {
      if (tab && !tab.closed && tab.location.href === 'about:blank') {
        tab.close();
      }
    } catch {
      // Not accessible: leave it open
    }
  }

  /** Load the course in the preview tab. Returns false if the tab was blocked. */
  static showCourse(
    tab: Window | null,
    router: Router,
    location: Location,
    programId: number,
    source: PreviewSource,
  ): boolean {
    const path = location.prepareExternalUrl(
      router.serializeUrl(
        router.createUrlTree(['/programs', programId, 'details'], {
          queryParams: { [this.QUERY_PARAM]: source },
        }),
      ),
    );
    // Absolute URL: don't rely on the blank tab inheriting this page's base URL
    const url = new URL(path, window.location.href).href;
    if (tab && !tab.closed) {
      // A reused tab still holds the old preview's state; with hash routing a
      // URL change alone won't reload it, so force a fresh load after the reset.
      let reused = false;
      try {
        reused = tab.location.href !== 'about:blank';
      } catch {
        reused = true;
      }
      tab.location.href = url;
      if (reused) {
        tab.location.reload();
      }
      tab.focus();
      return true;
    }
    return !!window.open(url, this.tabName(programId));
  }
}
