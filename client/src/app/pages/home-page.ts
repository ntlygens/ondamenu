import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ContentService } from '../services/content-service';
import { AUDIENCE_LINKS } from '../core/site';

/** Home: intro, audience tiles, "why us" panels, how-it-works steps, closing call-to-action. */
@Component({
  selector: 'odm-home-page',
  imports: [RouterLink, MatIconModule],
  host: { class: 'page' },
  template: `
    @if (page(); as p) {
      <section class="intro" aria-labelledby="homeTitle">
        <p class="eyebrow">{{ p.eyebrow }}</p>
        <h2 id="homeTitle">{{ p.title }}</h2>
        <p class="lede">{{ p.lede }}</p>
      </section>

      <section class="features" aria-label="Who OnDaMenu is for">
        <div class="feature-grid">
          @for (a of audienceLinks; track a.route) {
            <a class="tile" [routerLink]="a.route">
              <span class="tile-icon" aria-hidden="true"><mat-icon>{{ a.icon }}</mat-icon></span>
              <h3>{{ a.label }}</h3>
              <p>{{ a.desc }}</p>
              <span class="tile-more">Explore <span aria-hidden="true">→</span></span>
            </a>
          }
        </div>
      </section>

      <section class="whyUsData" aria-label="Why OnDaMenu">
        @for (panel of p.panels; track panel.title; let i = $index) {
          <article class="svc-card" [class.svc-card--dark]="i === 1">
            <h3>{{ panel.title }}</h3>
            @if (panel.subtitle) { <p class="svc-sub">{{ panel.subtitle }}</p> }
            <p class="svc-body">{{ panel.body }}</p>
            @if (panel.link; as link) {
              <a class="svc-link" [routerLink]="link.route">{{ link.label }} <span aria-hidden="true">→</span></a>
            }
          </article>
        }
      </section>

      @if (steps().length) {
        <section class="steps" aria-labelledby="stepsTitle">
          <p class="eyebrow">How it works</p>
          <h2 id="stepsTitle" class="section-title">{{ p.stepsTitle }}</h2>
          <ol class="step-list">
            @for (step of steps(); track step._id; let i = $index) {
              <li class="step">
                <span class="num" aria-hidden="true">{{ i + 1 }}</span>
                <h3>{{ step.title }}</h3>
                <p>{{ step.text }}</p>
              </li>
            }
          </ol>
        </section>
      }

      <section class="closing-cta">
        <h2>{{ p.closing.title }}</h2>
        <p>{{ p.closing.text }}</p>
        <div class="cta-row">
          <a class="btn btn--primary" [routerLink]="p.closing.primary.route">{{ p.closing.primary.label }}</a>
          @if (p.closing.secondary; as second) {
            <a class="btn btn--ghost" [routerLink]="second.route">{{ second.label }}</a>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .tile {
      display: flex;
      flex-direction: column;
      padding: 1.6rem;
      border: 1px solid var(--site-line);
      border-radius: 14px;
      background: var(--site-white);
      box-shadow: 0 4px 14px rgba(15, 31, 58, 0.06);
      color: inherit;
      text-decoration: none;
      text-align: left;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .tile:hover { transform: translateY(-3px); border-color: var(--site-accent); box-shadow: 0 10px 26px rgba(15, 31, 58, 0.12); }
    .tile-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 52px; height: 52px; border-radius: 12px;
      background: var(--site-midnight);
      mat-icon { color: var(--site-accent); }
    }
    .tile h3 { margin: 1rem 0 0.4rem; color: var(--site-navy); font-size: 1.3rem; }
    .tile p { margin: 0 0 1rem; line-height: 1.6; }
    .tile-more { margin-top: auto; color: var(--site-blue); font-weight: 600; }
  `],
})
export class HomePage {
  private readonly content = inject(ContentService);
  protected readonly page = this.content.page(() => 'home');
  protected readonly steps = this.content.stepsFor(() => 'home');
  protected readonly audienceLinks = AUDIENCE_LINKS;
}
