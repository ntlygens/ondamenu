import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentService } from '../services/content-service';
import { FeatureCard } from '../core/feature-card';

/**
 * One layout for the sibling pages (For Diners, For Restaurants); the route's data.page picks the content:
 * intro, "why us" panels, feature cards, photo banner, closing call-to-action.
 */
@Component({
  selector: 'odm-audience-page',
  imports: [RouterLink, FeatureCard],
  host: { class: 'page' },
  template: `
    @if (page(); as p) {
      <section class="intro" aria-labelledby="pageTitle">
        <p class="eyebrow">{{ p.eyebrow }}</p>
        <h2 id="pageTitle">{{ p.title }}</h2>
        <p class="lede">{{ p.lede }}</p>
      </section>

      <section class="whyUsData" aria-label="Highlights">
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

      @if (features().length) {
        <section class="features" aria-labelledby="featuresTitle">
          <h2 id="featuresTitle" class="section-title">{{ p.featuresTitle }}</h2>
          <div class="feature-grid">
            @for (f of features(); track f._id) {
              <odm-feature-card [feature]="f" />
            }
          </div>
        </section>
      }

      @if (p.banner; as b) {
        <section class="photo-banner" [style.background-image]="'url(' + b.img + ')'">
          <div class="photo-banner-copy">
            <h2>{{ b.title }}</h2>
            <p>{{ b.text }}</p>
            @if (b.cta; as cta) {
              <a class="btn btn--primary" [routerLink]="cta.route">{{ cta.label }}</a>
            }
          </div>
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
})
export class AudiencePage {
  private readonly content = inject(ContentService);
  private readonly data = toSignal(inject(ActivatedRoute).data);
  private readonly pageId = computed<string>(() => this.data()?.['page'] ?? '');

  protected readonly page = this.content.page(this.pageId);
  protected readonly features = this.content.featuresFor(this.pageId);
}
