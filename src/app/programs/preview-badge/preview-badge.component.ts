import { Component } from '@angular/core';

/** Marks pages where staff are previewing a course they manage. */
@Component({
  selector: 'app-preview-badge',
  template: `
    <span class="preview-badge" role="status" title="All content unlocked, exams optional">
      <span class="preview-dot" aria-hidden="true"></span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M2 12C3.6 7.9 7.4 5 12 5C16.6 5 20.4 7.9 22 12C20.4 16.1 16.6 19 12 19C7.4 19 3.6 16.1 2 12Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2.5"/>
      </svg>
      Preview mode
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
      }

      .preview-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        background: #d32f2f;
        border-radius: 999px;
        box-shadow: 0 2px 8px rgba(211, 47, 47, 0.35);
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        line-height: 1;
        text-transform: uppercase;
        white-space: nowrap;
        cursor: help;
      }

      .preview-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #fff;
        animation: preview-pulse 1.6s ease-in-out infinite;
      }

      @keyframes preview-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .preview-dot {
          animation: none;
        }
      }
    `,
  ],
})
export class PreviewBadgeComponent {}
