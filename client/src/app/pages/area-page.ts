import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { RoleGate } from '../core/role-gate';
import { Role } from '../services/auth-service';

/** Protected account area (restaurant, courier). The route's data sets the role and the wording. */
@Component({
  selector: 'odm-area-page',
  imports: [RouterLink, RoleGate],
  host: { class: 'page' },
  template: `
    <section class="panel">
      <odm-role-gate [role]="role()" [denied]="text('denied')">
        <p class="eyebrow">{{ text('eyebrow') }}</p>
        <h1>{{ text('heading') }}</h1>
        <p class="lede">{{ text('text') }}</p>
        <a class="btn btn--ghost" routerLink="/account">Back to your account</a>
      </odm-role-gate>
    </section>
  `,
})
export class AreaPage {
  private readonly data = toSignal(inject(ActivatedRoute).data);
  protected readonly role = computed<Role>(() => this.data()?.['role'] ?? 'admin');
  protected text(key: string): string {
    return this.data()?.[key] ?? '';
  }
}
