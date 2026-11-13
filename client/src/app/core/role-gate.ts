import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, Role } from '../services/auth-service';

/**
 * Shows its content only to a signed-in person who holds the given role (or any one of several).
 * This only decides what the page displays: the server checks the role again on every request for data.
 */
@Component({
  selector: 'odm-role-gate',
  imports: [RouterLink],
  template: `
    @if (!auth.ready()) {
      <p class="lede" role="status">Checking your account…</p>
    } @else if (!auth.user()) {
      <h1>Please sign in</h1>
      <p class="lede">You need to be signed in to see this page.</p>
      <a class="btn btn--primary" routerLink="/account">Sign in</a>
    } @else if (!allowed()) {
      <h1>This page isn't available on your account</h1>
      <p class="lede">{{ denied() }}</p>
      <a class="btn btn--ghost" routerLink="/account">Back to your account</a>
    } @else {
      <ng-content />
    }
  `,
})
export class RoleGate {
  readonly role = input.required<Role | Role[]>();
  /** Shown to a signed-in person who lacks the role. */
  readonly denied = input('This area is not part of your account.');

  protected readonly auth = inject(AuthService);
  protected readonly allowed = computed(() => {
    const roles = this.auth.user()?.roles ?? [];
    return [this.role()].flat().some((role) => roles.includes(role));
  });
}
