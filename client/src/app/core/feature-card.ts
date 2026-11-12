import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FeatureDoc } from '../models/content';

/** Illustrated feature card: a photo when the record has one, otherwise an icon band. */
@Component({
  selector: 'odm-feature-card',
  imports: [MatIconModule],
  template: `
    <article class="card">
      @if (feature().img; as img) {
        <img class="media" [src]="img" alt="" loading="lazy" />
      } @else {
        <div class="media band" aria-hidden="true">
          <span class="ring"></span>
          <mat-icon>{{ feature().icon }}</mat-icon>
        </div>
      }
      <div class="body">
        <h3>{{ feature().title }}</h3>
        <p>{{ feature().text }}</p>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .card {
      height: 100%;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--site-line);
      border-radius: 14px;
      overflow: hidden;
      background: var(--site-white);
      box-shadow: 0 6px 18px rgba(7, 24, 54, 0.2);
      text-align: left;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(7, 24, 54, 0.32); }
    .media { display: block; width: 100%; height: 130px; object-fit: cover; }
    .band {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at 80% 20%, rgba(234, 106, 94, 0.3), transparent 55%),
        linear-gradient(135deg, var(--site-midnight) 0%, var(--site-navy) 100%);
      mat-icon { position: relative; font-size: 44px; width: 44px; height: 44px; color: var(--site-pop); }
    }
    .ring { position: absolute; width: 84px; height: 84px; border-radius: 50%; border: 1px dashed rgba(255, 196, 188, 0.5); }
    .body { padding: 1.25rem 1.4rem 1.5rem; }
    h3 { margin: 0 0 0.45rem; color: var(--site-navy); font-size: 1.2rem; line-height: 1.3; }
    p { margin: 0; color: var(--site-text); line-height: 1.65; }
  `],
})
export class FeatureCard {
  readonly feature = input.required<FeatureDoc>();
}
