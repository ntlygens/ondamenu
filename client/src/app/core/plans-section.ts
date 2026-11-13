import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ANNUAL_MONTHS_FREE, DATA_REMOVAL_DAYS, DELIVERY_SHARE_PERCENT, NOTICE_DAYS, PLANS, TRIAL_DAYS } from './plans';

/** Plans and pricing for restaurants: the promises up top, one card per plan, the fine print below. */
@Component({
  selector: 'odm-plans-section',
  imports: [RouterLink, MatIconModule],
  template: `
    <section class="plans" id="plans" aria-labelledby="plansTitle">
      <h2 id="plansTitle" class="section-title">Plans and pricing</h2>
      <p class="pitch">
        Delivery apps take 15% to 30% of every delivery order.
        <strong>OnDaMenu takes {{ share }}%, and nothing at all on pickup.</strong>
      </p>
      <p class="pitch pitch--second">
        Other online ordering services start at $149 to $249 a month, and some charge up to $499 to set you up.
        <strong>OnDaMenu starts at \${{ plans[0].price }} a month.</strong>
      </p>

      <ul class="promises">
        <li><mat-icon aria-hidden="true">event_available</mat-icon><span><strong>First {{ trialWeeks }} weeks free</strong> on every plan; cancel any time in the trial</span></li>
        <li><mat-icon aria-hidden="true">shopping_bag</mat-icon><span><strong>No commission</strong> on pickup orders</span></li>
        <li><mat-icon aria-hidden="true">delivery_dining</mat-icon><span><strong>{{ share }}% on delivery orders</strong>, not 15% to 30%</span></li>
        <li><mat-icon aria-hidden="true">sync</mat-icon><span><strong>No setup fee with Clover:</strong> sign in and we bring in your menu, categories and prices</span></li>
      </ul>

      <div class="grid">
        @for (plan of plans; track plan.id) {
          <article class="plan" [class.plan--featured]="plan.featured">
            @if (plan.featured) { <span class="flag">Recommended</span> }
            <h3>{{ plan.name }}</h3>
            <p class="price"><span class="amount">\${{ plan.price }}</span> <span class="per">a month</span></p>
            <p class="yearly">or \${{ yearly(plan.price) }} a year: {{ monthsFree }} months free</p>
            <p class="trial">First {{ trialWeeks }} weeks free</p>
            <p class="fit">{{ plan.fit }}</p>
            <p class="delivery"><mat-icon aria-hidden="true">delivery_dining</mat-icon><span>{{ plan.delivery }}</span></p>
            <ul class="includes">
              @for (line of plan.includes; track line) {
                <li><mat-icon aria-hidden="true">check</mat-icon><span>{{ line }}</span></li>
              }
            </ul>
            <a class="btn btn--primary" routerLink="/contact" [attr.aria-label]="'Start with the ' + plan.name + ' plan'">Start free</a>
          </article>
        }
      </div>

      <div class="terms" aria-labelledby="termsTitle">
        <h3 id="termsTitle">No lock-in, no exit fees</h3>
        <dl>
          <div><dt>During the trial</dt><dd>Cancel any time in the first {{ trialWeeks }} weeks and pay nothing.</dd></div>
          <div><dt>Paying monthly</dt><dd>Leave with {{ noticeDays }} days' written notice. There is no fee for leaving.</dd></div>
          <div><dt>Paying yearly</dt><dd>Get {{ monthsFree }} months free. If you leave early we refund the unused part, with the months you used charged at the monthly price.</dd></div>
          <div><dt>Your data</dt><dd>Your page and menu come down when your plan ends, and your account data is deleted within {{ removalDays }} days. Order and payment records are kept only as long as the law requires.</dd></div>
        </dl>
      </div>

      <p class="fine">
        Every plan: {{ share }}% of the food and drink total on delivery orders, no commission on pickup orders.
        Monthly price is per restaurant and starts after the {{ trialWeeks }}-week trial; cancel any time during the trial and pay nothing.
        No setup fee applies to restaurants that run on Clover.
        Delivery app rates and other services' prices are the ones they publish (four US online ordering services checked), as of November 2026.
      </p>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .plans { margin: 0 0 2.5rem; text-align: left; }
    .section-title { margin-bottom: 0.6rem; }
    .pitch { margin: 0 0 0.6rem; max-width: 60ch; color: var(--site-on-blue-soft); font-size: 1.12rem; line-height: 1.6; }
    .pitch strong { color: var(--site-on-blue); }
    .pitch--second { font-size: 1rem; }

    /* The three promises: one row on a wide screen, stacked on a phone. */
    .promises { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.6rem; margin: 1.25rem 0 1.5rem; padding: 0; list-style: none; }
    .promises li {
      display: flex; align-items: center; gap: 0.7rem; min-width: 0;
      padding: 0.8rem 1rem; border-radius: 10px; border-left: 4px solid var(--site-pop);
      background: var(--site-midnight); color: var(--site-on-blue-soft); line-height: 1.35;
    }
    .promises strong { color: var(--site-white); }
    .promises mat-icon { flex: none; color: var(--site-pop); }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; align-items: stretch; }
    .plan {
      position: relative; display: flex; flex-direction: column; min-width: 0;
      padding: 1.75rem 1.5rem 1.5rem; border-radius: 14px; border-top: 5px solid var(--site-accent);
      background: linear-gradient(160deg, var(--site-cloud) 0%, var(--site-tint) 100%);
      box-shadow: 0 6px 18px rgba(7, 24, 54, 0.22); color: var(--site-text);
    }
    h3 { margin: 0 0 0.5rem; color: var(--site-navy); font-size: 1.35rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
    .price { margin: 0; color: var(--site-midnight); line-height: 1; }
    .amount { font-size: 2.6rem; font-weight: 800; }
    .per { color: var(--site-muted); font-size: 1rem; font-weight: 600; }
    .yearly { margin: 0.45rem 0 0; color: var(--site-muted); font-size: 0.95rem; font-weight: 600; }
    .plan--featured .yearly { color: var(--site-accent-soft); }
    .trial { align-self: flex-start; margin: 0.6rem 0 0; padding: 0.25rem 0.6rem; border-radius: 5px; background: var(--site-good); color: var(--site-white); font-size: 0.85rem; font-weight: 700; font-style: italic; }
    .fit { margin: 0.9rem 0 0; line-height: 1.5; }
    .delivery {
      display: flex; align-items: flex-start; gap: 0.55rem;
      margin: 1rem 0 0; padding: 0.7rem 0.8rem; border-radius: 8px;
      background: rgba(27, 87, 159, 0.1); color: var(--site-navy); font-weight: 600; line-height: 1.4;
    }
    .delivery mat-icon { flex: none; color: var(--site-accent); }
    .includes { display: grid; gap: 0.5rem; margin: 1rem 0 1.5rem; padding: 0; list-style: none; }
    .includes li { display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.45; }
    .includes mat-icon { flex: none; width: 20px; height: 20px; font-size: 20px; margin-top: 0.1rem; color: var(--site-good); }
    .btn { margin-top: auto; justify-content: center; }

    /* The middle plan: the dark card, coral accents. */
    .plan--featured {
      border-top-color: var(--site-pop);
      background: linear-gradient(160deg, var(--site-midnight) 0%, var(--site-navy) 100%);
      color: rgba(255, 255, 255, 0.88);
    }
    .plan--featured h3, .plan--featured .price { color: var(--site-white); }
    .plan--featured .per { color: var(--site-accent-soft); }
    .plan--featured .delivery { background: rgba(255, 255, 255, 0.1); color: var(--site-white); }
    .plan--featured .delivery mat-icon { color: var(--site-pop); }
    .plan--featured .includes mat-icon { color: var(--site-accent-soft); }
    .plan--featured .btn--primary { background: var(--site-pop); color: var(--site-on-pop); box-shadow: none; }
    .plan--featured .btn--primary:hover { background: var(--site-pop-hover); }
    .flag { position: absolute; top: 0.9rem; right: 1rem; padding: 0.2rem 0.55rem; border-radius: 5px; background: var(--site-pop); color: var(--site-on-pop); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }

    /* How leaving works: one light card under the plans. */
    .terms { margin: 1.25rem 0 0; padding: 1.5rem; border-radius: 14px; border-left: 5px solid var(--site-accent); background: linear-gradient(135deg, var(--site-cloud) 0%, var(--site-tint) 100%); box-shadow: 0 6px 18px rgba(7, 24, 54, 0.22); }
    .terms h3 { margin: 0 0 1rem; font-size: 1.15rem; }
    .terms dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem 1.5rem; margin: 0; }
    .terms div { min-width: 0; }
    .terms dt { margin: 0 0 0.3rem; color: var(--site-accent-deep); font-size: 0.85rem; font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: 0.03em; }
    .terms dd { margin: 0; color: var(--site-text); line-height: 1.55; }

    .fine { margin: 1rem 0 0; max-width: 90ch; color: var(--site-on-blue-soft); font-size: 0.9rem; line-height: 1.55; }
  `],
})
export class PlansSection {
  protected readonly plans = PLANS;
  protected readonly share = DELIVERY_SHARE_PERCENT;
  protected readonly trialWeeks = TRIAL_DAYS / 7;
  protected readonly monthsFree = ANNUAL_MONTHS_FREE;
  protected readonly noticeDays = NOTICE_DAYS;
  protected readonly removalDays = DATA_REMOVAL_DAYS;

  /** A year's price with the free months taken off, with a thousands comma: 100 a month -> "1,000". */
  protected yearly(monthly: number): string {
    return (monthly * (12 - ANNUAL_MONTHS_FREE)).toLocaleString('en-US');
  }
}
