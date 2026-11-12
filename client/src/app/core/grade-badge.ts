import { Component, input } from '@angular/core';

/**
 * NYC health inspection grade, as published by the city.
 * Shows "Not yet graded" when there is none; never a made-up letter.
 */
@Component({
  selector: 'odm-grade-badge',
  template: `
    <span class="label">NYC Health</span>
    @if (grade(); as letter) {
      <span class="letter" [attr.aria-label]="'Grade ' + letter">{{ letter }}</span>
    } @else {
      <span class="none">Not yet graded</span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex; flex-direction: column; align-items: center; gap: 2px; min-width: 52px;
      padding: 5px 8px 6px; border-radius: 8px; background: var(--site-white);
      box-shadow: 0 2px 8px rgba(7, 24, 54, 0.35); text-align: center; line-height: 1;
    }
    .label { color: var(--site-muted); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .letter { color: var(--site-navy); font-size: 1.5rem; font-weight: 800; }
    .none { max-width: 5.5em; color: var(--site-text); font-size: 0.68rem; font-weight: 600; line-height: 1.15; }
  `],
})
export class GradeBadge {
  readonly grade = input<string | null>(null);
}
