import { Component, computed, input } from '@angular/core';

/**
 * NYC health inspection grade, as published by the city.
 * Shows "Not yet graded" when there is none; never a made-up letter.
 *
 * `compact` is the small version for the menu page's strip: "Grade" over the letter,
 * or over a question mark when the restaurant has not been graded yet.
 */
@Component({
  selector: 'odm-grade-badge',
  host: { '[class.compact]': 'compact()', role: 'img', '[attr.aria-label]': 'spoken()', '[attr.title]': 'spoken()' },
  template: `
    <span class="label" aria-hidden="true">{{ compact() ? 'Grade' : 'NYC Health' }}</span>
    @if (grade(); as letter) {
      <span class="letter" aria-hidden="true">{{ letter }}</span>
    } @else if (compact()) {
      <span class="letter letter--none" aria-hidden="true">?</span>
    } @else {
      <span class="none" aria-hidden="true">Not yet graded</span>
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

    /* Small version: same white tile, one fixed size whatever it holds. */
    :host(.compact) { box-sizing: border-box; width: 2.5rem; min-width: 0; height: 2.5rem; justify-content: center; gap: 3px; padding: 0; border: 1px solid var(--site-line); box-shadow: 0 1px 4px rgba(7, 24, 54, 0.25); }
    :host(.compact) .label { font-size: 0.55rem; letter-spacing: 0.06em; }
    :host(.compact) .letter { font-size: 1.15rem; }
    .letter--none { color: var(--site-muted); }
  `],
})
export class GradeBadge {
  readonly grade = input<string | null>(null);
  readonly compact = input(false);

  /** What a screen reader says, and the tooltip. */
  protected readonly spoken = computed(() =>
    this.grade() ? `NYC health inspection grade ${this.grade()}` : 'NYC health inspection grade: not yet graded');
}
